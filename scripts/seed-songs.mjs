import fs from 'node:fs'
import path from 'node:path'

const SONGS_DIR = path.resolve(process.cwd(), '.local', 'songs')
const API_VERSION = '2025-02-01'

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) return
  const content = fs.readFileSync(envPath, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    let val = trimmed.slice(eqIdx + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) {
      process.env[key] = val
    }
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

function makeKey(prefix, index) {
  return `${prefix}-${index}`
}

function parseSongFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '')
  const lines = raw.split(/\r?\n/)

  // First non-empty line is the song title
  let cursor = 0
  while (cursor < lines.length && !lines[cursor].trim()) {
    cursor++
  }
  if (cursor >= lines.length) {
    throw new Error(`Empty song file: ${filePath}`)
  }

  const title = lines[cursor].trim()
  const rest = lines.slice(cursor + 1).join('\n')

  // Match: <verseName> { <verseBody> }
  const verses = []
  const verseRegex = /([^{}]+?)\s*\{([^}]*)\}/g
  let match
  let verseIdx = 0

  while ((match = verseRegex.exec(rest)) !== null) {
    const name = match[1].trim()
    const body = match[2]
    const verseLines = body
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((text, lineIdx) => ({
        _key: makeKey(`l${verseIdx}`, lineIdx),
        _type: 'verseLine',
        text,
        voiceTypes: [],
      }))

    verses.push({
      _key: makeKey('v', verseIdx),
      _type: 'verse',
      name,
      voiceTypes: [],
      verseLines,
    })
    verseIdx++
  }

  if (verses.length === 0) {
    throw new Error(`No { ... } verses found in ${filePath}`)
  }

  const idSlug = path
    .basename(filePath, path.extname(filePath))
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')

  return {
    _id: `song-${idSlug}`,
    _type: 'song',
    title,
    slug: {
      _type: 'slug',
      current: slugify(title) || idSlug,
    },
    verses,
  }
}

async function main() {
  loadEnvLocal()
  const isDryRun = process.argv.includes('--dry-run')

  if (!fs.existsSync(SONGS_DIR)) {
    console.error(`Directory not found: ${SONGS_DIR}`)
    process.exit(1)
  }

  const files = fs
    .readdirSync(SONGS_DIR)
    .filter((f) => f.endsWith('.txt'))
    .sort()

  const docs = files.map((file) => parseSongFile(path.join(SONGS_DIR, file)))

  console.log(`Parsed ${docs.length} songs from .local/songs:`)
  for (const doc of docs) {
    const lineCount = doc.verses.reduce(
      (sum, v) => sum + v.verseLines.length,
      0
    )
    console.log(
      `  - ${doc.title} (${doc._id}): ${doc.verses.length} verses, ${lineCount} lines`
    )
  }

  if (isDryRun) {
    console.log('\nDry run complete. No changes written to Sanity.')
    return
  }

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  const token = process.env.SANITY_API_WRITE_TOKEN

  if (!projectId) {
    console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local')
    process.exit(1)
  }
  if (!token) {
    console.error(
      'Missing SANITY_API_WRITE_TOKEN in .env.local (create an Editor token at sanity.io/manage -> API -> Tokens)'
    )
    process.exit(1)
  }

  const mutations = [
    {
      createIfNotExists: {
        _id: 'voiceType-choir',
        _type: 'voiceType',
        name: 'Choir',
      },
    },
    ...docs.map((doc) => ({ createOrReplace: doc })),
  ]

  const url = `https://${projectId}.api.sanity.io/v${API_VERSION}/data/mutate/${dataset}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ mutations }),
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error(`Sanity API error (${res.status}):\n${errText}`)
    process.exit(1)
  }

  const result = await res.json()
  console.log(
    `\nSuccessfully seeded ${docs.length} songs + Choir voiceType (transactionId: ${result.transactionId}).`
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
