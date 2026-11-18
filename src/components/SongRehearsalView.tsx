'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { CHOIR_VOICE_TYPE_NAME } from '@/sanity/constants'
import { expandSongLines, type Song } from '@/sanity/lib/queries'
import { accentText, backButton, heading, muted } from './ui'

interface SongRehearsalViewProps {
  song: Song
  voiceTypes: string[]
  backHref: string
  backLabel: string
  playlistTitle?: string
  nextSong?: {
    title: string
    href: string
  } | null
}

export default function SongRehearsalView({
  song,
  voiceTypes,
  backHref,
  backLabel,
  playlistTitle,
  nextSong,
}: SongRehearsalViewProps) {
  // lineIndex: -1 means showing just the title (before revealing line 1)
  // 0..lines.length - 1 means showing that verse line
  const [lineIndex, setLineIndex] = useState<number>(-1)
  const [selectedVoices, setSelectedVoices] = useState<string[]>([
    CHOIR_VOICE_TYPE_NAME,
  ])

  // Reset to title state if navigating to another song
  useEffect(() => {
    setLineIndex(-1)
  }, [song._id])

  // Load saved voice selection on this device
  useEffect(() => {
    try {
      const raw = localStorage.getItem('selectedVoices')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          setSelectedVoices(
            parsed.filter((v): v is string => typeof v === 'string')
          )
        }
      }
    } catch {}
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
      } catch {}
      return next
    })
  }, [])

  const allLines = React.useMemo(() => expandSongLines(song), [song])

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

  useEffect(() => {
    setLineIndex((prev) => (prev >= totalLines ? totalLines - 1 : prev))
  }, [totalLines])

  const goNext = useCallback(() => {
    setLineIndex((prev) => (prev < totalLines - 1 ? prev + 1 : prev))
  }, [totalLines])

  const goPrev = useCallback(() => {
    setLineIndex((prev) => (prev > -1 ? prev - 1 : -1))
  }, [])

  const restartSong = useCallback(() => {
    setLineIndex(-1)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        goNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goNext, goPrev])

  const isAtTitleState = lineIndex === -1
  const isAtLastLine = totalLines > 0 && lineIndex === totalLines - 1
  const progressPercent =
    totalLines > 0 ? Math.max(0, ((lineIndex + 1) / totalLines) * 100) : 0

  return (
    <div className="flex min-h-[100dvh] flex-col bg-gradient-to-b from-amber-50/35 via-stone-100 to-stone-100 dark:from-amber-950/15 dark:via-stone-900 dark:to-stone-900">
      {/* Top Bar */}
      <header className="flex items-center justify-between border-b border-stone-200/80 px-4 py-3 dark:border-stone-800/80">
        <Link href={backHref} className={`${backButton} active:scale-95`}>
          <ArrowLeft className="h-4 w-4" />
          <span>{backLabel}</span>
        </Link>

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
        <div className="mb-4">
          {playlistTitle && (
            <p
              className={`mb-1 text-xs font-medium uppercase tracking-widest ${accentText}`}
            >
              {playlistTitle}
            </p>
          )}
          <h1 className="text-xl font-bold tracking-tight text-stone-700 sm:text-2xl dark:text-stone-200">
            {song.title}
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
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition active:scale-95 ${
                  isSelected
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
              <span
                className={`inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider ${accentText}`}
              >
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
                  (v) => v.toLowerCase() !== CHOIR_VOICE_TYPE_NAME.toLowerCase()
                )) && (
                <span
                  className={`inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider ${accentText}`}
                >
                  {[
                    lines[lineIndex].verseName,
                    lines[lineIndex].voiceTypes.some(
                      (v) =>
                        v.toLowerCase() !== CHOIR_VOICE_TYPE_NAME.toLowerCase()
                    )
                      ? lines[lineIndex].voiceTypes.join(', ')
                      : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              )}
              <p
                className={`text-2xl font-bold leading-snug tracking-tight sm:text-4xl ${heading}`}
              >
                {lines[lineIndex].text}
              </p>
              {isAtLastLine && (
                <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-emerald-700/85 dark:text-emerald-400/85">
                  End of song
                </p>
              )}
            </div>
          )}
        </div>

        {/* Next song in playlist shortcut when at the end of the song */}
        {isAtLastLine && nextSong && (
          <Link
            href={nextSong.href}
            className="mt-6 flex items-center gap-2 rounded-2xl border border-amber-500/35 bg-amber-500/10 px-5 py-3 text-sm font-semibold text-amber-800 transition hover:bg-amber-500/20 active:scale-95 dark:bg-amber-500/15 dark:text-amber-300 dark:hover:bg-amber-500/25"
          >
            <span>Next in playlist: {nextSong.title}</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
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
