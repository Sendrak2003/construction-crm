import { useEffect, useState } from 'react'

interface AsyncState<T> {
  data?: T
  error?: string
  loading: boolean
}

export function useAsync<T>(load: () => Promise<T>, deps: readonly unknown[]) {
  const [state, setState] = useState<AsyncState<T>>({ loading: true })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState((prev) => ({ ...prev, loading: true }))
    load()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false })
      })
      .catch((e: unknown) => {
        if (!cancelled) setState({ error: e instanceof Error ? e.message : String(e), loading: false })
      })
    return () => {
      cancelled = true
    }
  }, [...deps, tick])

  return { ...state, reload: () => setTick((value) => value + 1) }
}
