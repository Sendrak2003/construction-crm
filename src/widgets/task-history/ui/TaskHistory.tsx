import { StatusBadge } from '@/entities/task'
import { listHistory } from '@/entities/task-history'
import { formatDateTime, useAsync } from '@/shared/lib'
import { ErrorMessage, Loader } from '@/shared/ui'

interface Props {
  taskId: string
  version: number
}

export function TaskHistory({ taskId, version }: Props) {
  const { data, error, loading } = useAsync(() => listHistory(taskId), [taskId, version])

  if (loading && !data) return <Loader />

  return (
    <div className="stack">
      <ErrorMessage message={error} />
      {data?.map((entry) => (
        <div key={entry.id} className="history-item">
          <div className="row">
            {entry.from_status ? <StatusBadge status={entry.from_status} /> : <span className="muted">—</span>}
            <span>→</span>
            <StatusBadge status={entry.to_status} />
          </div>
          <div className="muted">
            {entry.actor?.full_name ?? 'Пользователь'} · {formatDateTime(entry.created_at)}
          </div>
          {entry.comment && <div>{entry.comment}</div>}
        </div>
      ))}
    </div>
  )
}
