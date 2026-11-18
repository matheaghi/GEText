'use client'

interface VoiceFilterPillsProps {
  availableVoices: string[]
  selectedVoices: string[]
  onToggle: (voice: string) => void
}

export default function VoiceFilterPills({
  availableVoices,
  selectedVoices,
  onToggle,
}: VoiceFilterPillsProps) {
  return (
    <div className="mb-6 flex max-w-xl flex-wrap items-center justify-center gap-1.5">
      {availableVoices.map((voice) => {
        const isSelected = selectedVoices.some(
          (v) => v.toLowerCase() === voice.toLowerCase()
        )
        return (
          <button
            key={voice}
            type="button"
            onClick={() => onToggle(voice)}
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
  )
}
