export type TaskStatus = 'new' | 'in_progress' | 'review' | 'accepted' | 'rework'

export interface Task {
  id: string
  title: string
  description: string
  object_id: string
  assignee_id: string | null
  author_id: string
  status: TaskStatus
  created_at: string
  assignee: { full_name: string } | null
  author: { full_name: string } | null
  object: { name: string } | null
}

export interface TaskInput {
  title: string
  description: string
  object_id: string
  assignee_id: string | null
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  new: 'Новая',
  in_progress: 'В работе',
  review: 'На проверке',
  accepted: 'Принята',
  rework: 'На доработке',
}
