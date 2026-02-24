/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

interface SidebarToggleContextValue {
  isSidebarCollapsed: boolean
  isMobileSidebarOpen: boolean
  toggleSidebarCollapse: () => void
  setMobileSidebarOpen: (value: boolean) => void
}

const SidebarToggleContext = createContext<SidebarToggleContextValue | null>(null)

export function SidebarToggleProvider({ children }: { children: ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => !prev)
  }

  return (
    <SidebarToggleContext.Provider
      value={{
        isSidebarCollapsed,
        isMobileSidebarOpen,
        toggleSidebarCollapse,
        setMobileSidebarOpen,
      }}
    >
      {children}
    </SidebarToggleContext.Provider>
  )
}

export function useSidebarToggle() {
  const context = useContext(SidebarToggleContext)

  if (!context) {
    throw new Error('useSidebarToggle must be used within SidebarToggleProvider')
  }

  return context
}
