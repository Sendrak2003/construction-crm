import { useState } from 'react'
import type { FormEvent } from 'react'
import type { ObjectInput } from '@/entities/object'
import { errorMessage } from '@/shared/lib'
import { ErrorMessage } from '@/shared/ui'

interface Props {
  initial?: ObjectInput
  submitLabel: string
  onSubmit: (values: ObjectInput) => Promise<void>
  onCancel: () => void
}

export function ObjectForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [address, setAddress] = useState(initial?.address ?? '')
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(undefined)
    try {
      await onSubmit({ name: name.trim(), address: address.trim() })
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
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label className="field">
        Адрес
        <input value={address} onChange={(e) => setAddress(e.target.value)} />
      </label>
      <ErrorMessage message={error} />
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
