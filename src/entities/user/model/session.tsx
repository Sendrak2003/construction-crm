import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '@/shared/api'
import { getProfile } from '../api/profiles'
import type { Profile } from './types'

interface SessionState {
  loading: boolean
  profile: Profile | null
}

const SessionContext = createContext<SessionState>({ loading: true, profile: null })

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({ loading: true, profile: null })

  useEffect(() => {
    const load = async (userId?: string) => {
      if (!userId) {
        setState({ loading: false, profile: null })
        return
      }
      setState((prev) => (prev.profile?.id === userId ? prev : { ...prev, loading: true }))
      try {
        setState({ loading: false, profile: await getProfile(userId) })
      } catch {
        setState({ loading: false, profile: null })
      }
    }

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED') return
      setTimeout(() => void load(session?.user.id), 0)
    })

    return () => data.subscription.unsubscribe()
  }, [])

  return <SessionContext.Provider value={state}>{children}</SessionContext.Provider>
}

export function useSession() {
  return useContext(SessionContext)
}
