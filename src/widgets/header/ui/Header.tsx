import { NavLink } from 'react-router-dom'
import { ROLE_LABELS, useSession } from '@/entities/user'
import { signOut } from '@/features/auth'

export function Header() {
  const { profile } = useSession()
  if (!profile) return null

  return (
    <header className="header">
      <nav className="row">
        <NavLink to="/objects">Объекты</NavLink>
        {profile.role === 'executor' && <NavLink to="/my-tasks">Мои задачи</NavLink>}
      </nav>
      <div className="row">
        <span className="muted">
          {profile.full_name || profile.email} · {ROLE_LABELS[profile.role]}
        </span>
        <button className="btn" onClick={() => void signOut()}>
          Выйти
        </button>
      </div>
    </header>
  )
}
