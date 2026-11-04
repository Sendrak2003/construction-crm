import { supabase, unwrap } from '@/shared/api'
import type { HistoryEntry } from '../model/types'

const COLUMNS =
  'id,from_status,to_status,comment,created_at,' +
  'actor:profiles!task_history_changed_by_fkey(full_name)'

export async function listHistory(taskId: string) {
  const result = await supabase
    .from('task_history')
    .select(COLUMNS)
    .eq('task_id', taskId)
    .order('created_at')
    .order('id')
  return unwrap(result) as unknown as HistoryEntry[]
}
