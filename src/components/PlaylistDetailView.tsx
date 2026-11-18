'use client'

import Link from 'next/link'
import { ArrowLeft, ChevronRight, ListMusic } from 'lucide-react'
import { formatSongSummary, type Playlist } from '@/sanity/lib/queries'
import {
  accentText,
  backButton,
  card,
  emptyBox,
  HeaderActions,
  heading,
  muted,
} from './ui'

interface PlaylistDetailViewProps {
  playlist: Playlist
}

export default function PlaylistDetailView({
  playlist,
}: PlaylistDetailViewProps) {
  const playlistSongs = playlist.songs || []

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-xl flex-col px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <Link href="/" className={backButton}>
          <ArrowLeft className="h-4 w-4" />
          <span>All Playlists</span>
        </Link>
        <HeaderActions />
      </header>

      <div className="mb-6">
        <div
          className={`mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${accentText}`}
        >
          <ListMusic className="h-4 w-4" />
          <span>Event Playlist</span>
        </div>
        <h1 className={`text-2xl font-bold tracking-tight ${heading}`}>
          {playlist.title}
        </h1>
        <p className={`mt-1 text-sm ${muted}`}>
          {playlistSongs.length}{' '}
          {playlistSongs.length === 1 ? 'song' : 'songs'}
        </p>
      </div>

      {playlistSongs.length === 0 ? (
        <div className={`${emptyBox} text-sm ${muted}`}>
          No songs in this playlist yet.
        </div>
      ) : (
        <div className="space-y-2.5">
          {playlistSongs.map((song, idx) => (
            <Link
              key={`${song._id}-${idx}`}
              href={`/playlists/${encodeURIComponent(playlist.slug)}/${encodeURIComponent(song.slug)}`}
              className={`flex w-full items-center justify-between rounded-2xl p-4 text-left transition active:scale-[0.99] ${card}`}
            >
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-xs font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                  {idx + 1}
                </span>
                <div>
                  <h2 className="font-semibold text-stone-800 dark:text-stone-100">
                    {song.title}
                  </h2>
                  <p className={`text-xs ${muted}`}>
                    {formatSongSummary(song)}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-stone-400 dark:text-stone-500" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
