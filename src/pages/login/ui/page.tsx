import { Navigate } from 'react-router-dom'
import { useSession } from '@/entities/user'
import { LoginForm } from '@/features/auth'
import { Loader } from '@/shared/ui'

export function LoginPage() {
  const { loading, profile } = useSession()

  if (loading) return <Loader />
  if (profile) return <Navigate to="/" replace />

  return (
    <div className="login">
      <LoginForm />
    </div>
  )
}
