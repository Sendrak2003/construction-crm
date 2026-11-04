import { useState } from 'react'
import type { FormEvent } from 'react'
import { listExecutors } from '@/entities/user'
import { errorMessage, useAsync } from '@/shared/lib'
import { ErrorMessage } from '@/shared/ui'

export interface TaskFormValues {
  title: string
  description: string
  assignee_id: string | null
}

interface Props {
  initial?: TaskFormValues
  submitLabel: string
  onSubmit: (values: TaskFormValues) => Promise<void>
  onCancel: () => void
}

export function TaskForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const executors = useAsync(listExecutors, [])
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [assigneeId, setAssigneeId] = useState(initial?.assignee_id ?? '')
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(undefined)
    try {
      await onSubmit({ title: title.trim(), description: description.trim(), assignee_id: assigneeId || null })
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="card stack" onSubmit={submit}>
      <label className="field">
        Название
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>
      <label className="field">
        Описание
        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <label className="field">
        Исполнитель
        <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
          <option value="">Не назначен</option>
          {executors.data?.map((executor) => (
            <option key={executor.id} value={executor.id}>
              {executor.full_name || executor.email}
            </option>
          ))}
        </select>
      </label>
      <ErrorMessage message={error ?? executors.error} />
      <div className="row">
        <button className="btn btn-primary" disabled={busy}>
          {submitLabel}
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Отмена
        </button>
      </div>
    </form>
  )
}
