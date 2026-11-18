'use client'

import { useState } from 'react'
import { ListMusic, Music, Sparkles } from 'lucide-react'
import {
  formatSongSummary,
  type Playlist,
  type Song,
} from '@/sanity/lib/queries'
import ListRowCard from './ListRowCard'
import { emptyBox, HeaderActions, heading, muted } from './ui'

interface HomeListViewProps {
  songs: Song[]
  playlists: Playlist[]
  isConfigured: boolean
}

function DemoModeBanner() {
  return (
    <div className="mb-5 rounded-2xl border border-amber-500/30 bg-amber-50/80 p-4 text-xs text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200">
      <div className="mb-1 flex items-center gap-1.5 font-semibold text-amber-900 dark:text-amber-300">
        <Sparkles className="h-4 w-4" />
        <span>Demo Mode (Sanity Project ID not set yet)</span>
      </div>
      <p className="text-amber-800/90 dark:text-amber-200/80">
        Showing sample songs below so you can test the rehearsal controls right away. Add{' '}
        <code className="rounded bg-black/10 px-1 py-0.5 dark:bg-black/30">
          NEXT_PUBLIC_SANITY_PROJECT_ID
        </code>{' '}
        to connect your live Sanity backend.
      </p>
    </div>
  )
}

export default function HomeListView({
  songs,
  playlists,
  isConfigured,
}: HomeListViewProps) {
  const [activeTab, setActiveTab] = useState<'songs' | 'playlists'>('songs')

  const tabClass = (active: boolean) =>
    `flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${active
      ? 'bg-stone-50 text-amber-800 shadow-sm dark:bg-stone-800 dark:text-amber-300'
      : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
    }`

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-xl flex-col px-4 py-6">
      <header className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${heading}`}>
            Lyrics Rehearsal
          </h1>
          <p className={`text-xs ${muted}`}>
            Pick a song or event playlist to practice line by line
          </p>
        </div>
        <HeaderActions />
      </header>

      {!isConfigured && <DemoModeBanner />}

      <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-stone-200/75 p-1 dark:bg-stone-800/60">
        <button
          onClick={() => setActiveTab('songs')}
          className={tabClass(activeTab === 'songs')}
        >
          <Music className="h-4 w-4" />
          <span>Songs ({songs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('playlists')}
          className={tabClass(activeTab === 'playlists')}
        >
          <ListMusic className="h-4 w-4" />
          <span>Playlists ({playlists.length})</span>
        </button>
      </div>

      {activeTab === 'songs' ? (
        songs.length === 0 ? (
          <div className={emptyBox}>
            <Music className="mx-auto mb-3 h-8 w-8 text-stone-400 dark:text-stone-500" />
            <p className="text-sm font-medium text-stone-600 dark:text-stone-300">
              No songs yet
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {songs.map((song) => (
                <ListRowCard
                key={song._id}
                href={`/songs/${encodeURIComponent(song.slug)}`}
                title = { song.title }
                subtitle = { formatSongSummary(song) }
                leading = {< Music className = "h-5 w-5" />}
              />
            ))}
          </div>
        )
        ): playlists.length === 0 ? (
      <div className={emptyBox}>
        <ListMusic className="mx-auto mb-3 h-8 w-8 text-stone-400 dark:text-stone-500" />
        <p className="text-sm font-medium text-stone-600 dark:text-stone-300">
          No playlists yet
        </p>
      </div>
      ) : (
      <div className="space-y-2.5">
        {playlists.map((playlist) => (
            <ListRowCard
              key={playlist._id}
            href={`/playlists/${encodeURIComponent(playlist.slug)}`}
              title = { playlist.title }
              subtitle = {`${playlist.songs?.length || 0} ${playlist.songs?.length === 1 ? 'song' : 'songs'
            }`}
        leading={<ListMusic className="h-5 w-5" />}
            />
          ))}
      </div>
      )}
    </div>
  )
}
