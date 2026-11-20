'use client'

import Link from 'next/link'
import { ArrowLeft, ListMusic } from 'lucide-react'
import {
  encodeSlugPath,
  formatSongSummary,
  type Playlist,
} from '@/sanity/lib/queries'
import HeaderActions from './HeaderActions'
import ListRowCard from './ListRowCard'
import { accentText, backButton, emptyBox, heading, muted } from './styles'

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
              <ListRowCard
              key={`${song._id}-${idx}`}
              href={`/playlists/${encodeURIComponent(playlist.slug)}/${encodeSlugPath(song.slug)}`}
              title = { song.title }
              subtitle = { formatSongSummary(song) }
              leading = { idx + 1}
          variant="badge"
            />
          ))}
        </div>
      )}
    </div>
  )
}
