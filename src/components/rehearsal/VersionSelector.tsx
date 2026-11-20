'use client'

import { ChevronDown } from 'lucide-react'
import type { Song } from '@/sanity/lib/queries'

const MAX_LABEL_LENGTH = 12

function getVersionLabel(song: Song): string {
  if (!song.originalId) return 'Original'
  return song.versionName?.trim() || song.title
}

function truncateLabel(label: string): string {
  return label.length > MAX_LABEL_LENGTH
    ? `${label.slice(0, MAX_LABEL_LENGTH)}...`
    : label
}

interface VersionSelectorProps {
  versions: Song[]
  currentSongId: string
  onSelect: (song: Song) => void
}

export default function VersionSelector({
  versions,
  currentSongId,
  onSelect,
}: VersionSelectorProps) {
  if (versions.length <= 1) return null

  const normalizedCurrentId = currentSongId.replace(/^drafts\./, '')
  const currentSong = versions.find(
    (v) => v._id.replace(/^drafts\./, '') === normalizedCurrentId
  )

  return (
    <div className="relative inline-flex items-center">
      <select
        aria-label="Select song version"
        title={currentSong ? getVersionLabel(currentSong) : undefined}
        value={normalizedCurrentId}
        onChange={(e) => {
          const chosen = versions.find(
            (v) => v._id.replace(/^drafts\./, '') === e.target.value
          )
          if (chosen) {
            onSelect(chosen)
          }
        }}
        className="appearance-none rounded-xl border border-stone-200/90 bg-stone-50/90 py-1.5 pr-7 pl-2.5 text-xs font-semibold text-stone-700 transition hover:border-amber-300/70 focus:border-amber-500/60 focus:outline-none dark:border-stone-700/70 dark:bg-stone-800/70 dark:text-stone-200 dark:hover:border-amber-500/30"
      >
        {versions.map((v) => (
          <option
            key={v._id}
            value={v._id.replace(/^drafts\./, '')}
            className="bg-stone-50 text-stone-800 dark:bg-stone-800 dark:text-stone-100"
          >
            {truncateLabel(getVersionLabel(v))}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-stone-400" />
    </div>
  )
}
