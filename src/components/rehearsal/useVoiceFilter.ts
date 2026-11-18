'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { CHOIR_VOICE_TYPE_NAME } from '@/sanity/constants'
import type { RehearsalLine } from '@/sanity/lib/queries'

const STORAGE_KEY = 'selectedVoices'

function buildAvailableVoices(
  voiceTypes: string[],
  allLines: RehearsalLine[]
): string[] {
  const seen = new Set<string>([CHOIR_VOICE_TYPE_NAME.toLowerCase()])
  const list = [CHOIR_VOICE_TYPE_NAME]

  const add = (voice: string) => {
    const trimmed = voice.trim()
    if (!trimmed) return
    const key = trimmed.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      list.push(trimmed)
    }
  }

  voiceTypes.forEach(add)
  allLines.forEach((line) => line.voiceTypes.forEach(add))
  return list
}

export function useVoiceFilter(
  voiceTypes: string[],
  allLines: RehearsalLine[]
) {
  const [selectedVoices, setSelectedVoices] = useState<string[]>([
    CHOIR_VOICE_TYPE_NAME,
  ])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        setSelectedVoices(
          parsed.filter((v): v is string => typeof v === 'string')
        )
      }
    } catch {}
  }, [])

  const toggleVoice = useCallback((voice: string) => {
    setSelectedVoices((prev) => {
      const lower = voice.toLowerCase()
      const exists = prev.some((v) => v.toLowerCase() === lower)
      const next = exists
        ? prev.filter((v) => v.toLowerCase() !== lower)
        : [...prev, voice]
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }, [])

  const availableVoices = useMemo(
    () => buildAvailableVoices(voiceTypes, allLines),
    [voiceTypes, allLines]
  )

  const filteredLines = useMemo(() => {
    const selectedSet = new Set(selectedVoices.map((v) => v.toLowerCase()))
    return allLines.filter((line) =>
      line.voiceTypes.some((v) => selectedSet.has(v.toLowerCase()))
    )
  }, [allLines, selectedVoices])

  return {
    availableVoices,
    selectedVoices,
    filteredLines,
    toggleVoice,
  }
}
