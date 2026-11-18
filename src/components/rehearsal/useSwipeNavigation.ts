'use client'

import { useRef, type TouchEvent } from 'react'

const MIN_SWIPE_DISTANCE = 60

/**
 * Triggers horizontal swipe callbacks (swipe left = next, swipe right = prev)
 * while ignoring touches on interactive elements, vertical scrolls, or small taps.
 */
export function useSwipeNavigation(onNext: () => void, onPrev: () => void) {
  const startRef = useRef<{ x: number; y: number } | null>(null)

  const onTouchStart = (e: TouchEvent) => {
    const target = e.target as HTMLElement | null
    if (target?.closest('button, a, input, select, textarea')) {
      startRef.current = null
      return
    }

    const touch = e.touches[0]
    if (!touch) return
    startRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const onTouchEnd = (e: TouchEvent) => {
    const start = startRef.current
    startRef.current = null
    if (!start) return

    const touch = e.changedTouches[0]
    if (!touch) return

    const deltaX = touch.clientX - start.x
    const deltaY = touch.clientY - start.y

    if (
      Math.abs(deltaX) < MIN_SWIPE_DISTANCE ||
      Math.abs(deltaX) <= Math.abs(deltaY) * 1.5
    ) {
      return
    }

    if (deltaX < 0) {
      onNext()
    } else {
      onPrev()
    }
  }

  return { onTouchStart, onTouchEnd }
}
