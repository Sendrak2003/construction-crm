import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { StatusBadge, deleteTask, getTask, updateTask } from '@/entities/task'
import { useSession } from '@/entities/user'
import { TaskForm } from '@/features/task-form'
import { TaskActions } from '@/features/task-transition'
import { errorMessage, formatDateTime, useAsync } from '@/shared/lib'
import { ErrorMessage, Loader } from '@/shared/ui'
import { TaskHistory } from '@/widgets/task-history'

export function TaskDetailsPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { profile } = useSession()
  const task = useAsync(() => getTask(id), [id])
  const [version, setVersion] = useState(0)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string>()

  const refresh = () => {
    task.reload()
    setVersion((value) => value + 1)
  }

  const remove = async () => {
    if (!window.confirm('Удалить задачу?')) return
    try {
      await deleteTask(id)
      navigate(`/objects/${task.data?.object_id}`)
    } catch (e) {
      setError(errorMessage(e))
    }
  }

  if (task.loading && !task.data) return <Loader />
  if (!task.data || !profile) return <ErrorMessage message={task.error} />

  const data = task.data

  return (
    <div className="stack">
      <Link to={`/objects/${data.object_id}`}>← {data.object?.name}</Link>
      {editing ? (
        <TaskForm
          initial={{ title: data.title, description: data.description, assignee_id: data.assignee_id }}
          submitLabel="Сохранить"
          onSubmit={async (values) => {
            await updateTask(id, values)
            setEditing(false)
            refresh()
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <div className="card stack">
          <div className="row row-between">
            <h1>{data.title}</h1>
            <StatusBadge status={data.status} />
          </div>
          <p>{data.description || <span className="muted">Без описания</span>}</p>
          <div className="muted">
            Исполнитель: {data.assignee?.full_name ?? 'не назначен'} · Автор: {data.author?.full_name ?? '—'} ·
            Создана: {formatDateTime(data.created_at)}
          </div>
          <TaskActions task={data} profile={profile} onChanged={refresh} />
          {profile.role === 'manager' && (
            <div className="row">
              <button className="btn" onClick={() => setEditing(true)}>
                Редактировать
              </button>
              <button className="btn btn-danger" onClick={() => void remove()}>
                Удалить
              </button>
            </div>
          )}
          <ErrorMessage message={error} />
        </div>
      )}
      <h2>История</h2>
      <TaskHistory taskId={id} version={version} />
    </div>
  )
}
