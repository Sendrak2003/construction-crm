import { useState } from 'react'
import type { FormEvent } from 'react'
import { errorMessage } from '@/shared/lib'
import { ErrorMessage } from '@/shared/ui'
import { signIn } from '../api/auth'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(undefined)
    try {
      await signIn(email, password)
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="card stack" onSubmit={submit}>
      <h1>Вход</h1>
      <label className="field">
        Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
      </label>
      <label className="field">
        Пароль
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </label>
      <ErrorMessage message={error} />
      <button className="btn btn-primary" disabled={busy}>
        Войти
      </button>
    </form>
  )
}
