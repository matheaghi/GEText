import { ExternalLink } from 'lucide-react'

export default function AdminLink() {
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
