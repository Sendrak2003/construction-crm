import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useSession } from '@/entities/user'
import { LoginPage } from '@/pages/login'
import { MyTasksPage } from '@/pages/my-tasks'
import { ObjectDetailsPage } from '@/pages/object-details'
import { ObjectsPage } from '@/pages/objects'
import { TaskDetailsPage } from '@/pages/task-details'
import { Loader } from '@/shared/ui'
import { Header } from '@/widgets/header'
import { Providers } from './providers'
import './styles/index.css'

function ProtectedLayout() {
  const { loading, profile } = useSession()

  if (loading) return <Loader />
  if (!profile) return <Navigate to="/login" replace />

  return (
    <>
      <Header />
      <main className="container">
        <Outlet />
      </main>
    </>
  )
}

function Home() {
  const { profile } = useSession()
  return <Navigate to={profile?.role === 'executor' ? '/my-tasks' : '/objects'} replace />
}

export function App() {
  return (
    <Providers>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedLayout />}>
          <Route index element={<Home />} />
          <Route path="/objects" element={<ObjectsPage />} />
          <Route path="/objects/:id" element={<ObjectDetailsPage />} />
          <Route path="/tasks/:id" element={<TaskDetailsPage />} />
          <Route path="/my-tasks" element={<MyTasksPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Providers>
  )
}
