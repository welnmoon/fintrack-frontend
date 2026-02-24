import { Wallet } from 'lucide-react'
import { APP_NAME } from '@/shared/const'

export function FintrackLogo() {
  return (
    <div className="flex items-center gap-2 text-foreground">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
        <Wallet className="h-5 w-5" />
      </span>
      <div className="leading-tight">
        <p className="text-sm font-semibold tracking-wide">{APP_NAME}</p>
        <p className="text-xs text-muted-foreground">Personal finance</p>
      </div>
    </div>
  )
}
