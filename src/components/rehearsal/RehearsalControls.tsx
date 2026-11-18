'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface RehearsalControlsProps {
  isAtTitleState: boolean
  isAtLastLine: boolean
  hasLines: boolean
  onPrev: () => void
  onNext: () => void
}

export default function RehearsalControls({
  isAtTitleState,
  isAtLastLine,
  hasLines,
  onPrev,
  onNext,
}: RehearsalControlsProps) {
  return (
    <footer className="border-t border-stone-200/80 bg-stone-100/90 p-4 pb-6 backdrop-blur dark:border-stone-800/80 dark:bg-stone-900/90">
      <div className="mx-auto grid max-w-xl grid-cols-2 gap-4">
        <button
          type="button"
          onClick={onPrev}
          disabled={isAtTitleState}
          aria-label="Previous line"
          className="flex h-20 touch-manipulation items-center justify-center gap-2 rounded-2xl border border-stone-200/90 bg-stone-50/95 text-lg font-semibold text-stone-700 shadow-sm transition hover:bg-stone-200/60 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-30 dark:border-stone-700/70 dark:bg-stone-800/80 dark:text-stone-200 dark:shadow-lg dark:hover:bg-stone-800"
        >
          <ChevronLeft className="h-7 w-7" />
          <span>Prev</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!hasLines || isAtLastLine}
          aria-label="Next line"
          className="flex h-20 touch-manipulation items-center justify-center gap-2 rounded-2xl bg-amber-600/90 text-lg font-semibold text-stone-50 shadow-lg shadow-amber-700/15 transition hover:bg-amber-600 active:scale-[0.98] disabled:pointer-events-none disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none dark:bg-amber-600/85 dark:hover:bg-amber-500/90 dark:disabled:bg-stone-800 dark:disabled:text-stone-500"
        >
          <span>{isAtTitleState ? 'First Line' : 'Next'}</span>
          <ChevronRight className="h-7 w-7" />
        </button>
      </div>
    </footer>
  )
}
