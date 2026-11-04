import { listMyTasks } from '@/entities/task'
import { useSession } from '@/entities/user'
import { useAsync } from '@/shared/lib'
import { ErrorMessage, Loader } from '@/shared/ui'
import { TaskList } from '@/widgets/task-list'

export function MyTasksPage() {
  const { profile } = useSession()
  const userId = profile?.id ?? ''
  const { data, error, loading } = useAsync(() => listMyTasks(userId), [userId])

  return (
    <div className="stack">
      <h1>Мои задачи</h1>
      <ErrorMessage message={error} />
      {loading && !data ? <Loader /> : <TaskList tasks={data ?? []} showObject />}
    </div>
  )
}
