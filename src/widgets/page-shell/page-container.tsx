import { cn } from '@/shared/lib'
import type { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
  return <section className={cn('space-y-6', className)}>{children}</section>
}
