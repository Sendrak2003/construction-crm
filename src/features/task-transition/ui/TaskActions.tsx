import { useState } from 'react'
import { changeTaskStatus } from '@/entities/task'
import type { Task } from '@/entities/task'
import type { Profile } from '@/entities/user'
import { errorMessage } from '@/shared/lib'
import { ErrorMessage } from '@/shared/ui'
import { getAvailableActions } from '../model/actions'
import type { TaskAction } from '../model/actions'

interface Props {
  task: Task
  profile: Profile
  onChanged: () => void
}

export function TaskActions({ task, profile, onChanged }: Props) {
  const [pending, setPending] = useState<TaskAction>()
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)

  const actions = getAvailableActions(task, profile)
  if (actions.length === 0) return null

  const run = async (action: TaskAction, text: string) => {
    setBusy(true)
    setError(undefined)
    try {
      await changeTaskStatus(task.id, action.to, text.trim())
      setPending(undefined)
      setComment('')
      onChanged()
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  const choose = (action: TaskAction) => {
    if (action.requiresComment) {
      setPending(action)
      return
    }
    void run(action, '')
  }

  return (
    <div className="stack">
      <div className="row">
        {actions.map((action) => (
          <button
            key={action.to}
            className={action.danger ? 'btn btn-danger' : 'btn btn-primary'}
            disabled={busy}
            onClick={() => choose(action)}
          >
            {action.label}
          </button>
        ))}
      </div>
      {pending && (
        <div className="stack">
          <label className="field">
            Комментарий (обязательно)
            <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} autoFocus />
          </label>
          <div className="row">
            <button
              className="btn btn-danger"
              disabled={busy || !comment.trim()}
              onClick={() => void run(pending, comment)}
            >
              {pending.label}
            </button>
            <button className="btn" onClick={() => setPending(undefined)}>
              Отмена
            </button>
          </div>
        </div>
      )}
      <ErrorMessage message={error} />
    </div>
  )
}
