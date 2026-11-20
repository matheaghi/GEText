'use client'

import { Search, X } from 'lucide-react'

interface SongSearchInputProps {
  value: string
  onChange: (value: string) => void
}

export default function SongSearchInput({
  value,
  onChange,
}: SongSearchInputProps) {
  return (
    <div className="relative mb-4">
      <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search songs..."
        aria-label="Search songs"
        className="w-full rounded-2xl border border-stone-200/90 bg-stone-50/90 py-2.5 pr-10 pl-10 text-sm text-stone-800 placeholder-stone-400 transition focus:border-amber-500/60 focus:outline-none dark:border-stone-700/60 dark:bg-stone-800/50 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-amber-400/50"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-lg p-1 text-stone-400 hover:bg-stone-200/60 hover:text-stone-700 dark:text-stone-500 dark:hover:bg-stone-700/60 dark:hover:text-stone-200"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
