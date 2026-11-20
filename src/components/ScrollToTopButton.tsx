'use client'

import { useEffect, useState, type RefObject } from 'react'
import { ArrowUp } from 'lucide-react'

interface ScrollToTopButtonProps {
  /** Element that must scroll above the viewport before the button appears. */
  targetRef: RefObject<HTMLElement | null>
}

export default function ScrollToTopButton({
  targetRef,
}: ScrollToTopButtonProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = targetRef.current
    if (!el) {
      setVisible(false)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(
          !entry.isIntersecting && entry.boundingClientRect.bottom <= 0
        )
      },
      { threshold: 0 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  })

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
      title="Scroll to top"
      className="fixed top-3 left-1/2 z-40 flex -translate-x-1/2 items-center justify-center rounded-full border border-stone-200/90 bg-stone-50/90 p-2.5 text-stone-600 shadow-md backdrop-blur transition hover:bg-amber-50/90 hover:text-amber-800 active:scale-95 dark:border-stone-700/70 dark:bg-stone-800/90 dark:text-stone-200 dark:hover:bg-stone-800 dark:hover:text-amber-300"
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  )
}
