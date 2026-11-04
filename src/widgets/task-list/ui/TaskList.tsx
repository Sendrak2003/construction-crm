import { Link } from 'react-router-dom'
import { StatusBadge } from '@/entities/task'
import type { Task } from '@/entities/task'
import { formatDateTime } from '@/shared/lib'

interface Props {
  tasks: Task[]
  showObject?: boolean
}

export function TaskList({ tasks, showObject }: Props) {
  if (tasks.length === 0) return <p className="muted">Задач нет</p>

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Задача</th>
          {showObject && <th>Объект</th>}
          <th>Исполнитель</th>
          <th>Статус</th>
          <th>Создана</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <tr key={task.id}>
            <td>
              <Link to={`/tasks/${task.id}`}>{task.title}</Link>
            </td>
            {showObject && <td>{task.object?.name}</td>}
            <td>{task.assignee?.full_name ?? '—'}</td>
            <td>
              <StatusBadge status={task.status} />
            </td>
            <td>{formatDateTime(task.created_at)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
