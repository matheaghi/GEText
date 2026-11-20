'use client'

import { useState } from 'react'
import { Button, Card, Text, TextArea } from '@sanity/ui'
import {
  type StringInputProps,
  useDocumentOperation,
  useFormValue,
} from 'sanity'

function makeKey(): string {
  return Math.random().toString(36).slice(2, 10)
}

function parseLyricsToVerses(raw: string) {
  const blocks = raw
    .trim()
    .split(/\r?\n\s*\r?\n+/)
    .map((block) =>
      block
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
    )
    .filter((lines) => lines.length > 0)

  return blocks.map((lines) => ({
    _key: makeKey(),
    _type: 'verse',
    verseLines: lines.map((text) => ({
      _key: makeKey(),
      _type: 'verseLine',
      text,
    })),
  }))
}

export function LyricsImportInput(_props: StringInputProps) {
  const [text, setText] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  const rawId = useFormValue(['_id']) as string | undefined
  const docId = rawId ? rawId.replace(/^drafts\./, '') : ''
  const { patch } = useDocumentOperation(docId, 'song')

  const handleImport = () => {
    const verses = parseLyricsToVerses(text)
    if (verses.length === 0 || !docId) return

    patch.execute([{ set: { verses } }])

    const lineCount = verses.reduce((sum, v) => sum + v.verseLines.length, 0)
    setStatus(
      `Imported ${verses.length} verse${verses.length === 1 ? '' : 's'} (${lineCount} line${lineCount === 1 ? '' : 's'}). Switch to the Song tab to review.`
    )
    setText('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Text size={1} muted>
        Paste song lyrics below. Each line becomes a verse line, and an empty
        line starts a new verse.
      </Text>

      <TextArea
        style={{ minHeight: '280px' }}
        value={text}
        onChange={(e) => {
          setText(e.currentTarget.value)
          if (status) setStatus(null)
        }}
        placeholder={`Line 1 of verse 1\nLine 2 of verse 1\n\nLine 1 of verse 2\nLine 2 of verse 2`}
      />

      <div>
        <Button
          text="Import"
          tone="primary"
          disabled={!text.trim() || !docId}
          onClick={handleImport}
        />
      </div>

      {status && (
        <Card padding={3} radius={2} tone="positive">
          <Text size={1}>{status}</Text>
        </Card>
      )}
    </div>
  )
}
