import { supabase, unwrap } from '@/shared/api'
import type { CrmObject, ObjectInput } from '../model/types'

const COLUMNS = 'id,name,address,created_at'

export async function listObjects() {
  const result = await supabase.from('objects').select(COLUMNS).order('name')
  return unwrap(result) as CrmObject[]
}

export async function getObject(id: string) {
  const result = await supabase.from('objects').select(COLUMNS).eq('id', id).maybeSingle()
  const object = unwrap(result) as CrmObject | null
  if (!object) throw new Error('Объект не найден')
  return object
}

export async function createObject(input: ObjectInput) {
  unwrap(await supabase.from('objects').insert(input))
}

export async function updateObject(id: string, input: ObjectInput) {
  unwrap(await supabase.from('objects').update(input).eq('id', id))
}

export async function deleteObject(id: string) {
  unwrap(await supabase.from('objects').delete().eq('id', id))
}
