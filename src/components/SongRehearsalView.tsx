'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronRight, RotateCcw } from 'lucide-react'
import {
  expandSongLines,
  type Song,
  type SongVersionOption,
} from '@/sanity/lib/queries'
import { accentText, backButton, muted } from './styles'
import LyricStageCard from './rehearsal/LyricStageCard'
import RehearsalControls from './rehearsal/RehearsalControls'
import VersionSelector from './rehearsal/VersionSelector'
import VoiceFilterPills from './rehearsal/VoiceFilterPills'
import { useSwipeNavigation } from './rehearsal/useSwipeNavigation'
import { useVoiceFilter } from './rehearsal/useVoiceFilter'

interface SongRehearsalViewProps {
  song: Song
  versions?: SongVersionOption[]
  versionBasePath?: string
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
  versions = [],
  versionBasePath = '/songs',
  backHref,
  backLabel,
  playlistTitle,
  nextSong,
}: SongRehearsalViewProps) {
  // -1 = title screen before revealing line 1; 0..N-1 = active line
  const [lineIndex, setLineIndex] = useState<number>(-1)
  const [swipeAnimation, setSwipeAnimation] = useState<{
    tick: number
    direction: 'next' | 'prev'
  } | null>(null)

  const allLines = useMemo(() => expandSongLines(song), [song])
  const { availableVoices, selectedVoices, filteredLines, toggleVoice } =
    useVoiceFilter(allLines)

  const totalLines = filteredLines.length
  const isAtTitleState = totalLines > 0 && lineIndex === -1
  const isAtLastLine = totalLines > 0 && lineIndex === totalLines - 1

  useEffect(() => {
    setSwipeAnimation(null)
    setLineIndex(-1)
  }, [song._id])

  useEffect(() => {
    setLineIndex((prev) => (prev >= totalLines ? totalLines - 1 : prev))
  }, [totalLines])

  const lastStepTimeRef = useRef<number>(0)

  const stepLine = useCallback(
    (delta: 1 | -1, fromSwipe = false) => {
      const now = Date.now()
      if (now - lastStepTimeRef.current < 80) return
      lastStepTimeRef.current = now

      if (fromSwipe) {
        setSwipeAnimation((prev) => ({
          tick: (prev?.tick ?? 0) + 1,
          direction: delta === 1 ? 'next' : 'prev',
        }))
      } else {
        setSwipeAnimation(null)
      }

      setLineIndex((prev) => {
        const next = prev + delta
        if (next < -1) return -1
        if (next > totalLines - 1) return prev
        return next
      })
    },
    [totalLines]
  )

  const goNext = useCallback(() => stepLine(1, false), [stepLine])
  const goPrev = useCallback(() => stepLine(-1, false), [stepLine])

  const { dragX, isDragging, swipeHandlers } = useSwipeNavigation({
    canGoNext: totalLines > 0 && !isAtLastLine,
    canGoPrev: lineIndex > -1,
    onNext: () => stepLine(1, true),
    onPrev: () => stepLine(-1, true),
  })

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

  const currentLine =
    lineIndex >= 0 && lineIndex < totalLines ? filteredLines[lineIndex] : null
  const progressPercent =
    totalLines > 0 ? Math.max(0, ((lineIndex + 1) / totalLines) * 100) : 0
  const slideClass =
    swipeAnimation?.direction === 'next'
      ? 'animate-slide-in-right'
      : swipeAnimation?.direction === 'prev'
        ? 'animate-slide-in-left'
        : ''

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
          onClick={() => {
            setSwipeAnimation(null)
            setLineIndex(-1)
          }}
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

      {versions.length > 1 && (
        <div className="flex justify-end px-4 pt-3">
          <VersionSelector
            versions={versions}
            currentSongId={song._id}
            basePath={versionBasePath}
          />
        </div>
      )}

      <main
        {...swipeHandlers}
        className="flex flex-1 touch-pan-y flex-col items-center justify-center overflow-x-hidden px-6 py-8 text-center"
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
          {song.versionName?.trim() && versions.length <= 1 && (
            <p className={`mt-1 text-xs font-medium ${accentText}`}>
              {song.versionName.trim()}
            </p>
          )}
        </div>

        <VoiceFilterPills
          availableVoices={availableVoices}
          selectedVoices={selectedVoices}
          onToggle={toggleVoice}
        />

        <div
          key={swipeAnimation?.tick ?? 0}
          className={`w-full max-w-xl ${!isDragging ? slideClass : ''}`}
          style={{
            transform: dragX
              ? `translateX(${dragX}px) rotate(${dragX * 0.015}deg)`
              : undefined,
            opacity: dragX
              ? Math.max(0.35, 1 - Math.abs(dragX) / 300)
              : undefined,
            transition: isDragging
              ? 'none'
              : 'transform 200ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms ease',
          }}
        >
          <LyricStageCard
            hasAnyLines={allLines.length > 0}
            currentLine={currentLine}
            isAtTitleState={isAtTitleState}
            isAtLastLine={isAtLastLine}
            selectedVoices={selectedVoices}
          />
        </div>

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
