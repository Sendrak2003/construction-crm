import { supabase, unwrap } from '@/shared/api'
import type { Profile } from '../model/types'

const COLUMNS = 'id,email,full_name,role'

export async function getProfile(id: string) {
  const result = await supabase.from('profiles').select(COLUMNS).eq('id', id).single()
  return unwrap(result) as Profile
}

export async function listExecutors() {
  const result = await supabase
    .from('profiles')
    .select(COLUMNS)
    .eq('role', 'executor')
    .order('full_name')
  return unwrap(result) as Profile[]
}
