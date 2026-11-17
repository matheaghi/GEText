'use client'

import { Moon, Sun } from 'lucide-react'

/**
 * Toggles the `dark` class on <html> and remembers the choice.
 * The icon is switched purely with CSS (dark:), so there's no
 * hydration mismatch and no flash on load.
 */
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const toggle = () => {
    const isDark = document.documentElement.classList.toggle('dark')
    try {
      localStorage.setItem('theme', isDark ? 'dark' : 'light')
    } catch { }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      className={`flex items-center justify-center rounded-xl border border-stone-200/90 bg-stone-50/80 p-2 text-stone-600 transition hover:bg-amber-50/70 hover:text-amber-800 active:scale-95 dark:border-stone-700/70 dark:bg-stone-800/70 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-amber-300 ${className}`}
    >
      {/* Light mode shows the moon (switch to dark); dark mode shows the sun (switch to light) */}
      <Moon className="h-4 w-4 dark:hidden" />
      <Sun className="hidden h-4 w-4 dark:block" />
    </button>
  )
}
