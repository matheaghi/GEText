'use client'

import { useRef, useState, type TouchEvent } from 'react'

const MIN_SWIPE_DISTANCE = 60

interface UseSwipeNavigationOptions {
  canGoNext: boolean
  canGoPrev: boolean
  onNext: () => void
  onPrev: () => void
}

/**
 * Tracks horizontal finger drag on the lyric stage so the card follows the
 * finger, and triggers next/prev when released past the swipe threshold.
 */
export function useSwipeNavigation({
  canGoNext,
  canGoPrev,
  onNext,
  onPrev,
}: UseSwipeNavigationOptions) {
  const startRef = useRef<{ x: number; y: number } | null>(null)
  const lockedHorizontalRef = useRef(false)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const onTouchStart = (e: TouchEvent) => {
    const target = e.target as HTMLElement | null
    if (target?.closest('button, a, input, select, textarea')) {
      startRef.current = null
      return
    }

    const touch = e.touches[0]
    if (!touch) return
    startRef.current = { x: touch.clientX, y: touch.clientY }
    lockedHorizontalRef.current = false
    setIsDragging(true)
  }

  const onTouchMove = (e: TouchEvent) => {
    const start = startRef.current
    if (!start) return

    const touch = e.touches[0]
    if (!touch) return

    const deltaX = touch.clientX - start.x
    const deltaY = touch.clientY - start.y

    if (!lockedHorizontalRef.current) {
      if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) return
      if (Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
        lockedHorizontalRef.current = true
      } else {
        // Vertical scroll: abort horizontal drag
        startRef.current = null
        setIsDragging(false)
        setDragX(0)
        return
      }
    }

    // Dampen drag if trying to swipe past the first or last line
    const isBlocked = (deltaX < 0 && !canGoNext) || (deltaX > 0 && !canGoPrev)
    setDragX(isBlocked ? deltaX * 0.22 : deltaX)
  }

  const finishTouch = (e: TouchEvent, cancelled = false) => {
    const start = startRef.current
    startRef.current = null
    setIsDragging(false)
    setDragX(0)

    if (cancelled || !start || !lockedHorizontalRef.current) return

    const touch = e.changedTouches[0]
    if (!touch) return

    const deltaX = touch.clientX - start.x
    const deltaY = touch.clientY - start.y

    if (
      Math.abs(deltaX) < MIN_SWIPE_DISTANCE ||
      Math.abs(deltaX) <= Math.abs(deltaY) * 1.2
    ) {
      return
    }

    if (deltaX < 0 && canGoNext) {
      onNext()
    } else if (deltaX > 0 && canGoPrev) {
      onPrev()
    }
  }

  return {
    dragX,
    isDragging,
    swipeHandlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd: (e: TouchEvent) => finishTouch(e, false),
      onTouchCancel: (e: TouchEvent) => finishTouch(e, true),
    },
  }
}
