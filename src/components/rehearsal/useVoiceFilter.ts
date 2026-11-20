'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { CHOIR_VOICE_TYPE_NAME } from '@/sanity/constants'
import type { RehearsalLine } from '@/sanity/lib/queries'

const STORAGE_KEY = 'selectedVoices'
const CHOIR_KEY = CHOIR_VOICE_TYPE_NAME.toLowerCase()

function buildSongVoices(allLines: RehearsalLine[]): string[] {
  const seen = new Set<string>([CHOIR_KEY])
  const list: string[] = []

  for (const line of allLines) {
    for (const voice of line.voiceTypes) {
      const trimmed = voice.trim()
      if (!trimmed) continue
      const key = trimmed.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        list.push(trimmed)
      }
    }
  }

  return list
}

export function useVoiceFilter(allLines: RehearsalLine[]) {
  const [selectedVoices, setSelectedVoices] = useState<string[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        setSelectedVoices(
          parsed.filter(
            (v): v is string =>
              typeof v === 'string' && v.trim().toLowerCase() !== CHOIR_KEY
          )
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
    () => buildSongVoices(allLines),
    [allLines]
  )

  const filteredLines = useMemo(() => {
    const selectedSet = new Set(selectedVoices.map((v) => v.toLowerCase()))
    selectedSet.add(CHOIR_KEY)

    return allLines.filter((line) =>
      line.voiceTypes.some((v) => selectedSet.has(v.toLowerCase()))
    )
  }, [allLines, selectedVoices])

  const hasChoir = useMemo(
    () =>
      allLines.some((line) =>
        line.voiceTypes.some((v) => v.trim().toLowerCase() === CHOIR_KEY)
      ),
    [allLines]
  )

  return {
    hasChoir,
    availableVoices,
    selectedVoices,
    filteredLines,
    toggleVoice,
  }
}
