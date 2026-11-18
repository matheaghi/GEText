'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { expandSongLines, type Song } from '@/sanity/lib/queries'
import { accentText, backButton, muted } from './ui'
import LyricStageCard from './rehearsal/LyricStageCard'
import RehearsalControls from './rehearsal/RehearsalControls'
import VoiceFilterPills from './rehearsal/VoiceFilterPills'
import { useSwipeNavigation } from './rehearsal/useSwipeNavigation'
import { useVoiceFilter } from './rehearsal/useVoiceFilter'

interface SongRehearsalViewProps {
  song: Song
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
  backHref,
  backLabel,
  playlistTitle,
  nextSong,
}: SongRehearsalViewProps) {
  // -1 = title screen before revealing line 1; 0..N-1 = active line
  const [lineIndex, setLineIndex] = useState<number>(-1)

  const allLines = useMemo(() => expandSongLines(song), [song])
  const { availableVoices, selectedVoices, filteredLines, toggleVoice } =
    useVoiceFilter(allLines)

  const totalLines = filteredLines.length

  useEffect(() => {
    setLineIndex(-1)
  }, [song._id])

  useEffect(() => {
    setLineIndex((prev) => (prev >= totalLines ? totalLines - 1 : prev))
  }, [totalLines])

  const lastStepTimeRef = useRef<number>(0)

  const goNext = useCallback(() => {
    const now = Date.now()
    if (now - lastStepTimeRef.current < 80) return
    lastStepTimeRef.current = now
    setLineIndex((prev) => (prev < totalLines - 1 ? prev + 1 : prev))
  }, [totalLines])

  const goPrev = useCallback(() => {
    const now = Date.now()
    if (now - lastStepTimeRef.current < 80) return
    lastStepTimeRef.current = now
    setLineIndex((prev) => (prev > -1 ? prev - 1 : -1))
  }, [])

  const swipeHandlers = useSwipeNavigation(goNext, goPrev)

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

  const isAtTitleState = totalLines > 0 && lineIndex === -1
  const isAtLastLine = totalLines > 0 && lineIndex === totalLines - 1
  const currentLine =
    lineIndex >= 0 && lineIndex < totalLines ? filteredLines[lineIndex] : null
  const progressPercent =
    totalLines > 0 ? Math.max(0, ((lineIndex + 1) / totalLines) * 100) : 0

  return (
    <div className="flex min-h-[100dvh] flex-col bg-gradient-to-b from-amber-50/35 via-stone-100 to-stone-100 dark:from-amber-950/15 dark:via-stone-900 dark:to-stone-900">
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
          onClick={() => setLineIndex(-1)}
          disabled={lineIndex <= -1}
          title="Start over"
          className={`${backButton} disabled:opacity-30 active:scale-95`}
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </header>

      <div className="h-1 w-full bg-stone-200/80 dark:bg-stone-800">
        <div
          className="h-full bg-amber-600/80 transition-all duration-200 ease-out dark:bg-amber-400/80"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <main
        {...swipeHandlers}
        className="flex flex-1 touch-pan-y flex-col items-center justify-center px-6 py-8 text-center"
      >
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

        <VoiceFilterPills
          availableVoices={availableVoices}
          selectedVoices={selectedVoices}
          onToggle={toggleVoice}
        />

        <LyricStageCard
          hasAnyLines={allLines.length > 0}
          currentLine={currentLine}
          isAtTitleState={isAtTitleState}
          isAtLastLine={isAtLastLine}
          selectedVoices={selectedVoices}
        />

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

      <RehearsalControls
        isAtTitleState={isAtTitleState}
        isAtLastLine={isAtLastLine}
        hasLines={totalLines > 0}
        onPrev={goPrev}
        onNext={goNext}
      />
    </div>
  )
}
