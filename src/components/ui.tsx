'use client'

import { ExternalLink } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export const muted = 'text-stone-500 dark:text-stone-400'
export const heading = 'text-stone-800 dark:text-stone-100'
export const card =
  'border border-stone-200/90 bg-stone-50/90 hover:border-amber-300/70 hover:bg-amber-50/40 dark:border-stone-700/60 dark:bg-stone-800/50 dark:hover:border-amber-500/30 dark:hover:bg-stone-800/80'
export const emptyBox =
  'rounded-2xl border border-stone-200/90 bg-stone-50/80 p-8 text-center dark:border-stone-700/60 dark:bg-stone-800/40'
export const backButton =
  'flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-stone-500 transition hover:bg-stone-200/70 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100'
export const accentText = 'text-amber-700/90 dark:text-amber-300/90'

export function AdminLink() {
  return (
    <a
      href="/admin"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 rounded-xl border border-stone-200/90 bg-stone-50/80 px-3 py-2 text-xs font-semibold text-stone-600 transition hover:bg-amber-50/70 hover:text-amber-800 dark:border-stone-700/70 dark:bg-stone-800/70 dark:text-stone-200 dark:hover:bg-stone-800 dark:hover:text-amber-300"
    >
      <span>Admin</span>
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  )
}

export function HeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <AdminLink />
    </div>
  )
}
