import type { TaskStatus } from '@/entities/task'

export interface HistoryEntry {
  id: number
  from_status: TaskStatus | null
  to_status: TaskStatus
  comment: string | null
  created_at: string
  actor: { full_name: string } | null
}
