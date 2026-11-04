import type { Profile } from '@/entities/user'
import type { Task, TaskStatus } from '@/entities/task'

export interface TaskAction {
  to: TaskStatus
  label: string
  requiresComment: boolean
  danger?: boolean
}

export function getAvailableActions(
  task: Pick<Task, 'status' | 'assignee_id'>,
  profile: Pick<Profile, 'id' | 'role'>,
): TaskAction[] {
  const isAssignee = task.assignee_id === profile.id
  const isManager = profile.role === 'manager'

  switch (task.status) {
    case 'new':
      return isAssignee ? [{ to: 'in_progress', label: 'Взять в работу', requiresComment: false }] : []
    case 'in_progress':
      return isAssignee ? [{ to: 'review', label: 'Отправить на проверку', requiresComment: false }] : []
    case 'review':
      return isManager
        ? [
            { to: 'accepted', label: 'Принять', requiresComment: false },
            { to: 'rework', label: 'Вернуть на доработку', requiresComment: true, danger: true },
          ]
        : []
    case 'rework':
      return isAssignee ? [{ to: 'in_progress', label: 'Взять в работу', requiresComment: false }] : []
    default:
      return []
  }
}
