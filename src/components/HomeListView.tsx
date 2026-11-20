'use client'

import { useMemo, useRef, useState } from 'react'
import { ListMusic, Music, Search } from 'lucide-react'
import {
  encodeSlugPath,
  formatSongSummary,
  type Playlist,
  type Song,
} from '@/sanity/lib/queries'
import DemoModeBanner from './DemoModeBanner'
import HeaderActions from './HeaderActions'
import ListRowCard from './ListRowCard'
import ScrollToTopButton from './ScrollToTopButton'
import SongSearchInput from './SongSearchInput'
import { emptyBox, heading, muted } from './styles'

interface HomeListViewProps {
  songs: Song[]
  playlists: Playlist[]
  isConfigured: boolean
}

export default function HomeListView({
  songs,
  playlists,
  isConfigured,
}: HomeListViewProps) {
  const [activeTab, setActiveTab] = useState<'songs' | 'playlists'>('songs')
  const [searchQuery, setSearchQuery] = useState('')
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const filteredSongs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return songs
    return songs.filter(
      (song) =>
        song.title.toLowerCase().includes(q) ||
        (song.versionName?.toLowerCase().includes(q) ?? false)
    )
  }, [songs, searchQuery])

  const tabClass = (active: boolean) =>
    `flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${
      active
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
          <>
            <ScrollToTopButton targetRef={searchContainerRef} />
            <div ref={searchContainerRef}>
              <SongSearchInput value={searchQuery} onChange={setSearchQuery} />
            </div>
            {filteredSongs.length === 0 ? (
              <div className={emptyBox}>
                <Search className="mx-auto mb-3 h-7 w-7 text-stone-400 dark:text-stone-500" />
                <p className="text-sm font-medium text-stone-600 dark:text-stone-300">
                  No songs match &ldquo;{searchQuery.trim()}&rdquo;
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-xs font-semibold text-amber-700 hover:underline dark:text-amber-300"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredSongs.map((song) => (
                  <ListRowCard
                    key={song._id}
                    href={`/songs/${encodeSlugPath(song.slug)}`}
                    title={song.title}
                    subtitle={formatSongSummary(song)}
                    leading={<Music className="h-5 w-5" />}
                  />
                ))}
              </div>
            )}
          </>
        )
      ) : playlists.length === 0 ? (
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
              title={playlist.title}
              subtitle={`${playlist.songs?.length || 0} ${
                playlist.songs?.length === 1 ? 'song' : 'songs'
              }`}
              leading={<ListMusic className="h-5 w-5" />}
            />
          ))}
        </div>
      )}
    </div>
  )
}
