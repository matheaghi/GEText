import { CHOIR_VOICE_TYPE_NAME } from '@/sanity/constants'
import type { RehearsalLine } from '@/sanity/lib/queries'
import { accentText, heading, muted } from '../ui'

interface LyricStageCardProps {
  hasAnyLines: boolean
  currentLine: RehearsalLine | null
  isAtTitleState: boolean
  isAtLastLine: boolean
  selectedVoices: string[]
}

function getLineBadge(line: RehearsalLine): string | null {
  const nonChoirVoices = line.voiceTypes.filter(
    (v) => v.toLowerCase() !== CHOIR_VOICE_TYPE_NAME.toLowerCase()
  )
  const parts = [
    line.verseName,
    nonChoirVoices.length > 0 ? nonChoirVoices.join(', ') : null,
  ].filter(Boolean)

  return parts.length > 0 ? parts.join(' · ') : null
}

export default function LyricStageCard({
  hasAnyLines,
  currentLine,
  isAtTitleState,
  isAtLastLine,
  selectedVoices,
}: LyricStageCardProps) {
  const badge = currentLine ? getLineBadge(currentLine) : null

  return (
    <div className="flex min-h-[220px] w-full max-w-xl flex-col items-center justify-center rounded-3xl border border-stone-200/90 bg-stone-50/90 p-6 shadow-sm sm:min-h-[260px] sm:p-10 dark:border-stone-700/60 dark:bg-stone-800/55 dark:shadow-inner">
      {!hasAnyLines ? (
        <p className="text-base text-stone-500 dark:text-stone-400">
          This song has no verse lines yet. Add lines in Admin.
        </p>
      ) : !currentLine && !isAtTitleState ? (
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
          {badge && (
            <span
              className={`inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider ${accentText}`}
            >
              {badge}
            </span>
          )}
          <p
            className={`text-2xl font-bold leading-snug tracking-tight sm:text-4xl ${heading}`}
          >
            {currentLine?.text}
          </p>
          {isAtLastLine && (
            <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-emerald-700/85 dark:text-emerald-400/85">
              End of song
            </p>
          )}
        </div>
      )}
    </div>
  )
}
