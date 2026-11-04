import { useState } from 'react'
import { Link } from 'react-router-dom'
import { createObject, listObjects } from '@/entities/object'
import { useSession } from '@/entities/user'
import { ObjectForm } from '@/features/object-form'
import { useAsync } from '@/shared/lib'
import { ErrorMessage, Loader } from '@/shared/ui'

export function ObjectsPage() {
  const { profile } = useSession()
  const { data, error, loading, reload } = useAsync(listObjects, [])
  const [creating, setCreating] = useState(false)

  return (
    <div className="stack">
      <div className="row row-between">
        <h1>Объекты</h1>
        {profile?.role === 'manager' && !creating && (
          <button className="btn btn-primary" onClick={() => setCreating(true)}>
            Добавить объект
          </button>
        )}
      </div>
      {creating && (
        <ObjectForm
          submitLabel="Создать"
          onSubmit={async (values) => {
            await createObject(values)
            setCreating(false)
            reload()
          }}
          onCancel={() => setCreating(false)}
        />
      )}
      <ErrorMessage message={error} />
      {loading && !data && <Loader />}
      {data?.length === 0 && <p className="muted">Объектов нет</p>}
      <div className="grid">
        {data?.map((object) => (
          <Link key={object.id} to={`/objects/${object.id}`} className="card card-link">
            <strong>{object.name}</strong>
            <span className="muted">{object.address}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
