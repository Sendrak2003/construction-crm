import type { PostgrestError } from '@supabase/supabase-js'

export function unwrap<T>(result: { data: T | null; error: PostgrestError | null }): T {
  if (result.error) {
    throw new Error(result.error.message)
  }
  return result.data as T
}
