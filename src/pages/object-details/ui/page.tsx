import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteObject, getObject, updateObject } from '@/entities/object'
import { createTask, listTasksByObject } from '@/entities/task'
import { useSession } from '@/entities/user'
import { ObjectForm } from '@/features/object-form'
import { TaskForm } from '@/features/task-form'
import { errorMessage, useAsync } from '@/shared/lib'
import { ErrorMessage, Loader } from '@/shared/ui'
import { TaskList } from '@/widgets/task-list'

export function ObjectDetailsPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { profile } = useSession()
  const object = useAsync(() => getObject(id), [id])
  const tasks = useAsync(() => listTasksByObject(id), [id])
  const [editing, setEditing] = useState(false)
  const [addingTask, setAddingTask] = useState(false)
  const [error, setError] = useState<string>()

  const isManager = profile?.role === 'manager'

  const remove = async () => {
    if (!window.confirm('Удалить объект вместе со всеми задачами?')) return
    try {
      await deleteObject(id)
      navigate('/objects')
    } catch (e) {
      setError(errorMessage(e))
    }
  }

  if (object.loading && !object.data) return <Loader />
  if (!object.data) return <ErrorMessage message={object.error} />

  return (
    <div className="stack">
      <Link to="/objects">← Все объекты</Link>
      {editing ? (
        <ObjectForm
          initial={object.data}
          submitLabel="Сохранить"
          onSubmit={async (values) => {
            await updateObject(id, values)
            setEditing(false)
            object.reload()
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <div className="row row-between">
          <div>
            <h1>{object.data.name}</h1>
            <p className="muted">{object.data.address}</p>
          </div>
          {isManager && (
            <div className="row">
              <button className="btn" onClick={() => setEditing(true)}>
                Редактировать
              </button>
              <button className="btn btn-danger" onClick={() => void remove()}>
                Удалить
              </button>
            </div>
          )}
        </div>
      )}
      <ErrorMessage message={error} />
      <div className="row row-between">
        <h2>Задачи</h2>
        {isManager && !addingTask && (
          <button className="btn btn-primary" onClick={() => setAddingTask(true)}>
            Добавить задачу
          </button>
        )}
      </div>
      {addingTask && (
        <TaskForm
          submitLabel="Создать"
          onSubmit={async (values) => {
            await createTask({ ...values, object_id: id })
            setAddingTask(false)
            tasks.reload()
          }}
          onCancel={() => setAddingTask(false)}
        />
      )}
      <ErrorMessage message={tasks.error} />
      {tasks.loading && !tasks.data ? <Loader /> : <TaskList tasks={tasks.data ?? []} />}
    </div>
  )
}
