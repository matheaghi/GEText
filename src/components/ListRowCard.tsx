import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { accentText, card, muted } from './ui'

interface ListRowCardProps {
  href: string
  title: string
  subtitle: string
  leading: React.ReactNode
  variant?: 'icon' | 'badge'
}

export default function ListRowCard({
  href,
  title,
  subtitle,
  leading,
  variant = 'icon',
}: ListRowCardProps) {
  const leadingClass =
    variant === 'badge'
      ? 'flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-xs font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
      : `flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 ${accentText}`

  return (
    <Link
      href={href}
      className={`flex w-full items-center justify-between rounded-2xl p-4 text-left transition active:scale-[0.99] ${card}`}
    >
      <div className="flex items-center gap-3.5">
        <div className={leadingClass}>{leading}</div>
        <div>
          <h2 className="font-semibold text-stone-800 dark:text-stone-100">
            {title}
          </h2>
          <p className={`text-xs ${muted}`}>{subtitle}</p>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-stone-400 dark:text-stone-500" />
    </Link>
  )
}
