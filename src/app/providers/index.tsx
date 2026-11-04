import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { SessionProvider } from '@/entities/user'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <SessionProvider>{children}</SessionProvider>
    </BrowserRouter>
  )
}
