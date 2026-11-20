'use client'

import AdminLink from './AdminLink'
import ThemeToggle from './ThemeToggle'

export default function HeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <AdminLink />
    </div>
  )
}
