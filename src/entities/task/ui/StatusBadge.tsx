import { STATUS_LABELS } from '../model/types'
import type { TaskStatus } from '../model/types'

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <span className={`badge badge-${status}`}>{STATUS_LABELS[status]}</span>
}
