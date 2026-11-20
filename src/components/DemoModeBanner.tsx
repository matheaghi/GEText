import { Sparkles } from 'lucide-react'

export default function DemoModeBanner() {
  return (
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
  )
}
