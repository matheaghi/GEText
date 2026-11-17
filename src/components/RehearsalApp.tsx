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
import ThemeToggle from './ThemeToggle'
import { CHOIR_VOICE_TYPE_NAME } from '@/sanity/constants'

export type VerseLineInput =
  | string
  | {
    text?: string | null
    voiceTypes?: string[]
  }

export interface Verse {
  name?: string
  voiceTypes?: string[]
  verseLines: VerseLineInput[]
}

export interface Song {
  _id: string
  title: string
  verses?: Verse[]
  verseLines?: string[]
}

export interface Playlist {
  _id: string
  title: string
  songs: Song[]
}

interface RehearsalLine {
  text: string
  verseName?: string
  voiceTypes: string[]
}

function cleanVoices(list?: string[]): string[] {
  return (list ?? []).map((v) => v?.trim()).filter((v): v is string => Boolean(v))
}

function expandSongLines(song: Song): RehearsalLine[] {
  if (song.verses && song.verses.length > 0) {
    const expanded: RehearsalLine[] = []
    for (const verse of song.verses) {
      const verseName = verse.name?.trim() || undefined
      const verseVoices = cleanVoices(verse.voiceTypes)

      for (const item of verse.verseLines ?? []) {
        const text = typeof item === 'string' ? item : item?.text ?? ''
        if (!text) continue
        const lineVoices =
          typeof item === 'string' ? [] : cleanVoices(item?.voiceTypes)

        // Line tags override verse tags; if neither has tags, it's Choir (everyone).
        const effectiveVoices =
          lineVoices.length > 0
            ? lineVoices
            : verseVoices.length > 0
              ? verseVoices
              : [CHOIR_VOICE_TYPE_NAME]

        expanded.push({ text, verseName, voiceTypes: effectiveVoices })
      }
    }
    return expanded
  }

  return (song.verseLines ?? []).map((text) => ({
    text,
    voiceTypes: [CHOIR_VOICE_TYPE_NAME],
  }))
}

function formatSongSummary(song: Song): string {
  const lineCount = expandSongLines(song).length
  const verseCount = song.verses?.length ?? 0
  const linesLabel = `${lineCount} ${lineCount === 1 ? 'line' : 'lines'}`
  if (verseCount > 0) {
    return `${verseCount} ${verseCount === 1 ? 'verse' : 'verses'} · ${linesLabel}`
  }
  return linesLabel
}

interface RehearsalAppProps {
  songs: Song[]
  playlists: Playlist[]
  voiceTypes: string[]
  isConfigured: boolean
}

// Shared class strings for slightly warm grey light + dark mode with a muted amber touch
const muted = 'text-stone-500 dark:text-stone-400'
const heading = 'text-stone-800 dark:text-stone-100'
const card =
  'border border-stone-200/90 bg-stone-50/90 hover:border-amber-300/70 hover:bg-amber-50/40 dark:border-stone-700/60 dark:bg-stone-800/50 dark:hover:border-amber-500/30 dark:hover:bg-stone-800/80'
const emptyBox =
  'rounded-2xl border border-stone-200/90 bg-stone-50/80 p-8 text-center dark:border-stone-700/60 dark:bg-stone-800/40'
const backButton =
  'flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-stone-500 transition hover:bg-stone-200/70 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100'
const accentText = 'text-amber-700/90 dark:text-amber-300/90'

function AdminLink() {
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

function HeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <AdminLink />
    </div>
  )
}

export default function RehearsalApp({
  songs,
  playlists,
  voiceTypes,
  isConfigured,
}: RehearsalAppProps) {
  const [activeTab, setActiveTab] = useState<'songs' | 'playlists'>('songs')
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  // lineIndex: -1 means showing just the title (before revealing line 1)
  // 0..lines.length - 1 means showing that verse line
  const [lineIndex, setLineIndex] = useState<number>(-1)
  const [selectedVoices, setSelectedVoices] = useState<string[]>([CHOIR_VOICE_TYPE_NAME])

  // Load saved voice selection on this device
  useEffect(() => {
    try {
      const raw = localStorage.getItem('selectedVoices')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          setSelectedVoices(parsed.filter((v): v is string => typeof v === 'string'))
        }
      }
    } catch { }
  }, [])

  const toggleVoice = useCallback((voice: string) => {
    setSelectedVoices((prev) => {
      const lower = voice.toLowerCase()
      const exists = prev.some((v) => v.toLowerCase() === lower)
      const next = exists
        ? prev.filter((v) => v.toLowerCase() !== lower)
        : [...prev, voice]
      try {
        localStorage.setItem('selectedVoices', JSON.stringify(next))
      } catch { }
      return next
    })
  }, [])

  const allLines = React.useMemo(
    () => (selectedSong ? expandSongLines(selectedSong) : []),
    [selectedSong]
  )

  // Available voice options: always Choir first, plus all Sanity voiceTypes & any used in this song
  const availableVoices = React.useMemo(() => {
    const seen = new Set<string>([CHOIR_VOICE_TYPE_NAME.toLowerCase()])
    const list = [CHOIR_VOICE_TYPE_NAME]
    const add = (v: string) => {
      const trimmed = v.trim()
      if (!trimmed) return
      const key = trimmed.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        list.push(trimmed)
      }
    }
    voiceTypes.forEach(add)
    allLines.forEach((l) => l.voiceTypes.forEach(add))
    return list
  }, [voiceTypes, allLines])

  const lines = React.useMemo(() => {
    const selectedSet = new Set(selectedVoices.map((v) => v.toLowerCase()))
    return allLines.filter((line) =>
      line.voiceTypes.some((v) => selectedSet.has(v.toLowerCase()))
    )
  }, [allLines, selectedVoices])

  const totalLines = lines.length

  // Keep lineIndex in bounds when voice filters change
  useEffect(() => {
    setLineIndex((prev) => (prev >= totalLines ? totalLines - 1 : prev))
  }, [totalLines])

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
      <div className="flex min-h-[100dvh] flex-col bg-gradient-to-b from-amber-50/35 via-stone-100 to-stone-100 dark:from-amber-950/15 dark:via-stone-900 dark:to-stone-900">
        {/* Top Bar */}
        <header className="flex items-center justify-between border-b border-stone-200/80 px-4 py-3 dark:border-stone-800/80">
          <button
            onClick={() => setSelectedSong(null)}
            className={`${backButton} active:scale-95`}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{selectedPlaylist ? selectedPlaylist.title : 'Songs'}</span>
          </button>

          <div className={`text-xs font-medium uppercase tracking-wider ${muted}`}>
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
            className={`${backButton} disabled:opacity-30 active:scale-95`}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </header>

        {/* Progress Bar */}
        <div className="h-1 w-full bg-stone-200/80 dark:bg-stone-800">
          <div
            className="h-full bg-amber-600/80 transition-all duration-200 ease-out dark:bg-amber-400/80"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Song Title & Current Line Stage */}
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center">
          {/* Always show the song title */}
          <div className="mb-4">
            {selectedPlaylist && (
              <p className={`mb-1 text-xs font-medium uppercase tracking-widest ${accentText}`}>
                {selectedPlaylist.title}
              </p>
            )}
            <h1 className="text-xl font-bold tracking-tight text-stone-700 sm:text-2xl dark:text-stone-200">
              {selectedSong.title}
            </h1>
          </div>

          {/* Voice Type Selector Pills */}
          <div className="mb-6 flex max-w-xl flex-wrap items-center justify-center gap-1.5">
            {availableVoices.map((voice) => {
              const isSelected = selectedVoices.some(
                (v) => v.toLowerCase() === voice.toLowerCase()
              )
              return (
                <button
                  key={voice}
                  type="button"
                  onClick={() => toggleVoice(voice)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition active:scale-95 ${isSelected
                      ? 'border-amber-600/80 bg-amber-600/90 text-stone-50 dark:border-amber-400/50 dark:bg-amber-500/25 dark:text-amber-200'
                      : 'border-stone-200/90 bg-stone-50/70 text-stone-500 hover:border-stone-300 hover:text-stone-700 dark:border-stone-700/60 dark:bg-stone-800/40 dark:text-stone-400 dark:hover:text-stone-200'
                    }`}
                >
                  {voice}
                </button>
              )
            })}
          </div>

          {/* Verse Line Display Box */}
          <div className="flex min-h-[220px] w-full max-w-xl flex-col items-center justify-center rounded-3xl border border-stone-200/90 bg-stone-50/90 p-6 shadow-sm sm:min-h-[260px] sm:p-10 dark:border-stone-700/60 dark:bg-stone-800/55 dark:shadow-inner">
            {allLines.length === 0 ? (
              <p className="text-base text-stone-500 dark:text-stone-400">
                This song has no verse lines yet. Add lines in Admin.
              </p>
            ) : totalLines === 0 ? (
              <p className="text-base text-stone-500 dark:text-stone-400">
                {selectedVoices.length === 0
                  ? 'Select at least one voice type above to see lyrics.'
                  : `No lines match your selected voice types (${selectedVoices.join(', ')}).`}
              </p>
            ) : isAtTitleState ? (
              <div className="space-y-3">
                <span className={`inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider ${accentText}`}>
                  Ready to practice
                </span>
                <p className={`text-lg font-medium sm:text-xl ${muted}`}>
                  Sing the first line in your head, then tap{' '}
                  <span className="font-semibold text-stone-700 dark:text-stone-200">
                    Next →
                  </span>{' '}
                  to check!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {(lines[lineIndex].verseName ||
                  lines[lineIndex].voiceTypes.some(
                    (v) => v.toLowerCase() !== 'choir'
                  )) && (
                    <span
                      className={`inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider ${accentText}`}
                    >
                      {[
                        lines[lineIndex].verseName,
                        lines[lineIndex].voiceTypes.some(
                          (v) => v.toLowerCase() !== 'choir'
                        )
                          ? lines[lineIndex].voiceTypes.join(', ')
                          : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  )}
                <p className={`text-2xl font-bold leading-snug tracking-tight sm:text-4xl ${heading}`}>
                  {lines[lineIndex].text}
                </p>
                {!isAtLastLine ? (
                  <p className="pt-2 text-xs font-medium text-stone-400 dark:text-stone-500">
                    Try singing line {lineIndex + 2} before tapping Next →
                  </p>
                ) : (
                  <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-emerald-700/85 dark:text-emerald-400/85">
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
              className="mt-6 flex items-center gap-2 rounded-2xl border border-amber-500/35 bg-amber-500/10 px-5 py-3 text-sm font-semibold text-amber-800 transition hover:bg-amber-500/20 active:scale-95 dark:bg-amber-500/15 dark:text-amber-300 dark:hover:bg-amber-500/25"
            >
              <span>Next in playlist: {nextSongInPlaylist.title}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </main>

        {/* Giant Mobile-First Left / Right Arrow Controls */}
        <footer className="border-t border-stone-200/80 bg-stone-100/90 p-4 pb-6 backdrop-blur dark:border-stone-800/80 dark:bg-stone-900/90">
          <div className="mx-auto grid max-w-xl grid-cols-2 gap-4">
            <button
              onClick={goPrev}
              disabled={isAtTitleState}
              aria-label="Previous line"
              className="flex h-20 items-center justify-center gap-2 rounded-2xl border border-stone-200/90 bg-stone-50/95 text-lg font-semibold text-stone-700 shadow-sm transition hover:bg-stone-200/60 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-30 dark:border-stone-700/70 dark:bg-stone-800/80 dark:text-stone-200 dark:shadow-lg dark:hover:bg-stone-800"
            >
              <ChevronLeft className="h-7 w-7" />
              <span>Prev</span>
            </button>

            <button
              onClick={goNext}
              disabled={totalLines === 0 || isAtLastLine}
              aria-label="Next line"
              className="flex h-20 items-center justify-center gap-2 rounded-2xl bg-amber-600/90 text-lg font-semibold text-stone-50 shadow-lg shadow-amber-700/15 transition hover:bg-amber-600 active:scale-[0.98] disabled:pointer-events-none disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none dark:bg-amber-600/85 dark:hover:bg-amber-500/90 dark:disabled:bg-stone-800 dark:disabled:text-stone-500"
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
            className={backButton}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>All Playlists</span>
          </button>
          <HeaderActions />
        </header>

        <div className="mb-6">
          <div className={`mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${accentText}`}>
            <ListMusic className="h-4 w-4" />
            <span>Event Playlist</span>
          </div>
          <h1 className={`text-2xl font-bold tracking-tight ${heading}`}>
            {selectedPlaylist.title}
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
              <button
                key={`${song._id}-${idx}`}
                onClick={() => startSong(song)}
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
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ==================== HOME LIST VIEW ====================
  const tabClass = (active: boolean) =>
    `flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${active
      ? 'bg-stone-50 text-amber-800 shadow-sm dark:bg-stone-800 dark:text-amber-300'
      : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
    }`

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-xl flex-col px-4 py-6">
      {/* Header */}
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

      {/* Setup Banner if Sanity isn't configured yet */}
      {!isConfigured && (
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
      )}

      {/* Tabs: Songs vs Playlists */}
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-stone-200/75 p-1 dark:bg-stone-800/60">
        <button onClick={() => setActiveTab('songs')} className={tabClass(activeTab === 'songs')}>
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

      {/* Songs Tab */}
      {activeTab === 'songs' ? (
        songs.length === 0 ? (
          <div className={emptyBox}>
            <Music className="mx-auto mb-3 h-8 w-8 text-stone-400 dark:text-stone-500" />
            <p className="text-sm font-medium text-stone-600 dark:text-stone-300">No songs yet</p>
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
                className={`flex w-full items-center justify-between rounded-2xl p-4 text-left transition active:scale-[0.99] ${card}`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 ${accentText}`}>
                    <Music className="h-5 w-5" />
                  </div>
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
              </button>
            ))}
          </div>
        )
      ) : /* Playlists Tab */
        playlists.length === 0 ? (
          <div className={emptyBox}>
            <ListMusic className="mx-auto mb-3 h-8 w-8 text-stone-400 dark:text-stone-500" />
            <p className="text-sm font-medium text-stone-600 dark:text-stone-300">No playlists yet</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {playlists.map((playlist) => (
              <button
                key={playlist._id}
                onClick={() => setSelectedPlaylist(playlist)}
                className={`flex w-full items-center justify-between rounded-2xl p-4 text-left transition active:scale-[0.99] ${card}`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 ${accentText}`}>
                    <ListMusic className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-stone-800 dark:text-stone-100">
                      {playlist.title}
                    </h2>
                    <p className={`text-xs ${muted}`}>
                      {playlist.songs?.length || 0}{' '}
                      {playlist.songs?.length === 1 ? 'song' : 'songs'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-stone-400 dark:text-stone-500" />
              </button>
            ))}
          </div>
        )}
    </div>
  )
}
