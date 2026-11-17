'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Music,
  ListMusic,
  RotateCcw,
  ArrowLeft,
  Sparkles,
  ExternalLink,
} from 'lucide-react'

export interface Song {
  _id: string
  title: string
  verseLines: string[]
}

export interface Playlist {
  _id: string
  title: string
  songs: Song[]
}

interface RehearsalAppProps {
  songs: Song[]
  playlists: Playlist[]
  isConfigured: boolean
}

export default function RehearsalApp({
  songs,
  playlists,
  isConfigured,
}: RehearsalAppProps) {
  const [activeTab, setActiveTab] = useState<'songs' | 'playlists'>('songs')
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  // lineIndex: -1 means showing just the title (before revealing line 1)
  // 0..verseLines.length - 1 means showing that verse line
  const [lineIndex, setLineIndex] = useState<number>(-1)

  const lines = selectedSong?.verseLines ?? []
  const totalLines = lines.length

  const startSong = useCallback((song: Song) => {
    setSelectedSong(song)
    setLineIndex(-1)
  }, [])

  const goNext = useCallback(() => {
    if (!selectedSong) return
    setLineIndex((prev) => (prev < totalLines - 1 ? prev + 1 : prev))
  }, [selectedSong, totalLines])

  const goPrev = useCallback(() => {
    if (!selectedSong) return
    setLineIndex((prev) => (prev > -1 ? prev - 1 : -1))
  }, [selectedSong])

  const restartSong = useCallback(() => {
    setLineIndex(-1)
  }, [])

  // Keyboard navigation for desktop convenience
  useEffect(() => {
    if (!selectedSong) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        goNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      } else if (e.key === 'Escape') {
        setSelectedSong(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedSong, goNext, goPrev])

  // Check if there is a next song in the currently active playlist
  const nextSongInPlaylist = React.useMemo(() => {
    if (!selectedPlaylist || !selectedSong) return null
    const idx = selectedPlaylist.songs.findIndex(
      (s) => s._id === selectedSong._id
    )
    if (idx !== -1 && idx + 1 < selectedPlaylist.songs.length) {
      return selectedPlaylist.songs[idx + 1]
    }
    return null
  }, [selectedPlaylist, selectedSong])

  // ==================== REHEARSAL VIEW ====================
  if (selectedSong) {
    const isAtTitleState = lineIndex === -1
    const isAtLastLine = totalLines > 0 && lineIndex === totalLines - 1
    const progressPercent =
      totalLines > 0 ? Math.max(0, ((lineIndex + 1) / totalLines) * 100) : 0

    return (
      <div className="flex min-h-[100dvh] flex-col bg-zinc-950 text-zinc-50">
        {/* Top Bar */}
        <header className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3">
          <button
            onClick={() => setSelectedSong(null)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-100 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{selectedPlaylist ? selectedPlaylist.title : 'Songs'}</span>
          </button>

          <div className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            {totalLines === 0
              ? 'No lines'
              : isAtTitleState
                ? `0 / ${totalLines}`
                : `Line ${lineIndex + 1} / ${totalLines}`}
          </div>

          <button
            onClick={restartSong}
            disabled={isAtTitleState}
            title="Start over"
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-100 disabled:opacity-30 active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </header>

        {/* Progress Bar */}
        <div className="h-1 w-full bg-zinc-900">
          <div
            className="h-full bg-indigo-500 transition-all duration-200 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Song Title & Current Line Stage */}
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center">
          {/* Always show the song title */}
          <div className="mb-6">
            {selectedPlaylist && (
              <p className="mb-1 text-xs font-medium uppercase tracking-widest text-indigo-400">
                {selectedPlaylist.title}
              </p>
            )}
            <h1 className="text-xl font-bold tracking-tight text-zinc-200 sm:text-2xl">
              {selectedSong.title}
            </h1>
          </div>

          {/* Verse Line Display Box */}
          <div className="flex min-h-[220px] w-full max-w-xl flex-col items-center justify-center rounded-3xl border border-zinc-800/90 bg-zinc-900/50 p-6 shadow-inner sm:min-h-[260px] sm:p-10">
            {totalLines === 0 ? (
              <p className="text-base text-zinc-500">
                This song has no verse lines yet. Add lines in Admin.
              </p>
            ) : isAtTitleState ? (
              <div className="space-y-3">
                <span className="inline-block rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  Ready to practice
                </span>
                <p className="text-lg font-medium text-zinc-400 sm:text-xl">
                  Sing the first line in your head, then tap{' '}
                  <span className="font-semibold text-zinc-200">Next →</span> to
                  check!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-2xl font-bold leading-snug tracking-tight text-white sm:text-4xl">
                  {lines[lineIndex]}
                </p>
                {!isAtLastLine ? (
                  <p className="pt-2 text-xs font-medium text-zinc-500">
                    Try singing line {lineIndex + 2} before tapping Next →
                  </p>
                ) : (
                  <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    End of song
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Next song in playlist shortcut when at the end of the song */}
          {isAtLastLine && nextSongInPlaylist && (
            <button
              onClick={() => startSong(nextSongInPlaylist)}
              className="mt-6 flex items-center gap-2 rounded-2xl border border-indigo-500/40 bg-indigo-500/15 px-5 py-3 text-sm font-semibold text-indigo-300 transition hover:bg-indigo-500/25 active:scale-95"
            >
              <span>Next in playlist: {nextSongInPlaylist.title}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </main>

        {/* Giant Mobile-First Left / Right Arrow Controls */}
        <footer className="border-t border-zinc-800/80 bg-zinc-950/90 p-4 pb-6 backdrop-blur">
          <div className="mx-auto grid max-w-xl grid-cols-2 gap-4">
            <button
              onClick={goPrev}
              disabled={isAtTitleState}
              aria-label="Previous line"
              className="flex h-20 items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 text-lg font-semibold text-zinc-200 shadow-lg transition hover:bg-zinc-800 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft className="h-7 w-7" />
              <span>Prev</span>
            </button>

            <button
              onClick={goNext}
              disabled={totalLines === 0 || isAtLastLine}
              aria-label="Next line"
              className="flex h-20 items-center justify-center gap-2 rounded-2xl bg-indigo-600 text-lg font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 active:scale-[0.98] disabled:pointer-events-none disabled:bg-zinc-800 disabled:text-zinc-500 disabled:shadow-none"
            >
              <span>{isAtTitleState ? 'First Line' : 'Next'}</span>
              <ChevronRight className="h-7 w-7" />
            </button>
          </div>
        </footer>
      </div>
    )
  }

  // ==================== PLAYLIST DETAIL VIEW ====================
  if (selectedPlaylist) {
    const playlistSongs = selectedPlaylist.songs || []
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-xl flex-col px-4 py-6">
        <header className="mb-6 flex items-center justify-between">
          <button
            onClick={() => setSelectedPlaylist(null)}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-100"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>All Playlists</span>
          </button>
          <a
            href="/admin"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-zinc-200"
          >
            <span>Admin</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </header>

        <div className="mb-6">
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
            <ListMusic className="h-4 w-4" />
            <span>Event Playlist</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {selectedPlaylist.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            {playlistSongs.length}{' '}
            {playlistSongs.length === 1 ? 'song' : 'songs'}
          </p>
        </div>

        {playlistSongs.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center text-sm text-zinc-400">
            No songs in this playlist yet.
          </div>
        ) : (
          <div className="space-y-2.5">
            {playlistSongs.map((song, idx) => (
              <button
                key={`${song._id}-${idx}`}
                onClick={() => startSong(song)}
                className="flex w-full items-center justify-between rounded-2xl border border-zinc-800/90 bg-zinc-900/60 p-4 text-left transition hover:border-zinc-700 hover:bg-zinc-900 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-300">
                    {idx + 1}
                  </span>
                  <div>
                    <h2 className="font-semibold text-zinc-100">
                      {song.title}
                    </h2>
                    <p className="text-xs text-zinc-400">
                      {song.verseLines?.length || 0} lines
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-zinc-500" />
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ==================== HOME LIST VIEW ====================
  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-xl flex-col px-4 py-6">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Lyrics Rehearsal
          </h1>
          <p className="text-xs text-zinc-400">
            Pick a song or event playlist to practice line by line
          </p>
        </div>
        <a
          href="/admin"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-800"
        >
          <span>Admin</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </header>

      {/* Setup Banner if Sanity isn't configured yet */}
      {!isConfigured && (
        <div className="mb-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200">
          <div className="mb-1 flex items-center gap-1.5 font-semibold text-amber-300">
            <Sparkles className="h-4 w-4" />
            <span>Demo Mode (Sanity Project ID not set yet)</span>
          </div>
          <p className="text-amber-200/80">
            Showing sample songs below so you can test the rehearsal controls right away. Add{' '}
            <code className="rounded bg-black/30 px-1 py-0.5">
              NEXT_PUBLIC_SANITY_PROJECT_ID
            </code>{' '}
            to connect your live Sanity backend.
          </p>
        </div>
      )}

      {/* Tabs: Songs vs Playlists */}
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-zinc-900 p-1">
        <button
          onClick={() => setActiveTab('songs')}
          className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${
            activeTab === 'songs'
              ? 'bg-zinc-800 text-white shadow'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Music className="h-4 w-4" />
          <span>Songs ({songs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('playlists')}
          className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${
            activeTab === 'playlists'
              ? 'bg-zinc-800 text-white shadow'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ListMusic className="h-4 w-4" />
          <span>Playlists ({playlists.length})</span>
        </button>
      </div>

      {/* Songs Tab */}
      {activeTab === 'songs' ? (
        songs.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center">
            <Music className="mx-auto mb-3 h-8 w-8 text-zinc-600" />
            <p className="text-sm font-medium text-zinc-300">No songs yet</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {songs.map((song) => (
              <button
                key={song._id}
                onClick={() => {
                  setSelectedPlaylist(null)
                  startSong(song)
                }}
                className="flex w-full items-center justify-between rounded-2xl border border-zinc-800/90 bg-zinc-900/60 p-4 text-left transition hover:border-zinc-700 hover:bg-zinc-900 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                    <Music className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-zinc-100">
                      {song.title}
                    </h2>
                    <p className="text-xs text-zinc-400">
                      {song.verseLines?.length || 0}{' '}
                      {song.verseLines?.length === 1 ? 'line' : 'lines'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-zinc-500" />
              </button>
            ))}
          </div>
        )
      ) : /* Playlists Tab */
      playlists.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center">
          <ListMusic className="mx-auto mb-3 h-8 w-8 text-zinc-600" />
          <p className="text-sm font-medium text-zinc-300">No playlists yet</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {playlists.map((playlist) => (
            <button
              key={playlist._id}
              onClick={() => setSelectedPlaylist(playlist)}
              className="flex w-full items-center justify-between rounded-2xl border border-zinc-800/90 bg-zinc-900/60 p-4 text-left transition hover:border-zinc-700 hover:bg-zinc-900 active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                  <ListMusic className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-zinc-100">
                    {playlist.title}
                  </h2>
                  <p className="text-xs text-zinc-400">
                    {playlist.songs?.length || 0}{' '}
                    {playlist.songs?.length === 1 ? 'song' : 'songs'}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-zinc-500" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
