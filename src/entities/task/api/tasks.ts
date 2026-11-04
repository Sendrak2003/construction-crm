import { supabase, unwrap } from '@/shared/api'
import type { Task, TaskInput, TaskStatus } from '../model/types'

const COLUMNS =
  'id,title,description,object_id,assignee_id,author_id,status,created_at,' +
  'assignee:profiles!tasks_assignee_id_fkey(full_name),' +
  'author:profiles!tasks_author_id_fkey(full_name),' +
  'object:objects(name)'

export async function listTasksByObject(objectId: string) {
  const result = await supabase
    .from('tasks')
    .select(COLUMNS)
    .eq('object_id', objectId)
    .order('created_at', { ascending: false })
  return unwrap(result) as unknown as Task[]
}

export async function listMyTasks(userId: string) {
  const result = await supabase
    .from('tasks')
    .select(COLUMNS)
    .eq('assignee_id', userId)
    .order('created_at', { ascending: false })
  return unwrap(result) as unknown as Task[]
}

export async function getTask(id: string) {
  const result = await supabase.from('tasks').select(COLUMNS).eq('id', id).maybeSingle()
  const task = unwrap(result) as unknown as Task | null
  if (!task) throw new Error('Задача не найдена')
  return task
}

export async function createTask(input: TaskInput) {
  unwrap(await supabase.from('tasks').insert(input))
}

export async function updateTask(id: string, input: Partial<TaskInput>) {
  unwrap(await supabase.from('tasks').update(input).eq('id', id))
}

export async function deleteTask(id: string) {
  unwrap(await supabase.from('tasks').delete().eq('id', id))
}

export async function changeTaskStatus(id: string, to: TaskStatus, comment: string) {
  unwrap(
    await supabase.rpc('change_task_status', {
      p_task_id: id,
      p_to: to,
      p_comment: comment || null,
    }),
  )
}
