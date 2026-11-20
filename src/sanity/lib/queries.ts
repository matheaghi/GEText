import { CHOIR_VOICE_TYPE_NAME } from '../constants'
import { client } from './client'
import { DEMO_PLAYLISTS, DEMO_SONGS } from './demoData'

export type VerseLineInput =
  | string
  | {
    text?: string | null
    voiceTypes?: string[]
  }

export interface Verse {
  name?: string
  voiceTypes?: string[]
  verseLines: VerseLineInput[]
}

export interface Song {
  _id: string
  slug: string
  title: string
  versionName?: string | null
  verses?: Verse[]
  verseLines?: string[]
}

export interface Playlist {
  _id: string
  slug: string
  title: string
  songs: Song[]
}

export interface RehearsalLine {
  text: string
  verseName?: string
  voiceTypes: string[]
}

function cleanVoices(list?: string[]): string[] {
  return (list ?? [])
    .map((v) => v?.trim())
    .filter((v): v is string => Boolean(v))
}

export function expandSongLines(song: Song): RehearsalLine[] {
      if (!song.verses?.length) {
        return (song.verseLines ?? []).map((text) => ({
          text,
          voiceTypes: [CHOIR_VOICE_TYPE_NAME],
        }))
      }

        const expanded: RehearsalLine[] = []
        for (const verse of song.verses) {
          const verseName = verse.name?.trim() || undefined
          const verseVoices = cleanVoices(verse.voiceTypes)

          for (const item of verse.verseLines ?? []) {
            const text = typeof item === 'string' ? item : (item?.text ?? '')
            if (!text) continue

          const lineVoices =
            typeof item === 'string' ? [] : cleanVoices(item?.voiceTypes)

          // Line tags override verse tags; if neither has tags, it's Choir (everyone).
          const effectiveVoices =
            lineVoices.length > 0
              ? lineVoices
              : verseVoices.length > 0
                ? verseVoices
                : [CHOIR_VOICE_TYPE_NAME]

          expanded.push({ text, verseName, voiceTypes: effectiveVoices })
        }
      }
      return expanded
    }

    export function encodeSlugPath(slug: string): string {
  return slug.split('/').map(encodeURIComponent).join('/')
}

export function formatSongSummary(song: Song): string {
      const lineCount = expandSongLines(song).length
      const verseCount = song.verses?.length ?? 0
      const linesLabel = `${lineCount} ${lineCount === 1 ? 'line' : 'lines'}`
      const base =
        verseCount > 0
          ? `${verseCount} ${verseCount === 1 ? 'verse' : 'verses'} · ${linesLabel}`
          : linesLabel
      return song.versionName?.trim()
        ? `${song.versionName.trim()} · ${base}`
        : base
    }

    const SONG_FIELDS = `
  _id,
  "slug": coalesce(slug.current, _id),
  title,
  versionName,
  "verses": coalesce(verses[]{
    name,
    "voiceTypes": coalesce(voiceTypes[]->name, []),
    "verseLines": coalesce(verseLines[]{
      "text": select(defined(text) => text, @),
      "voiceTypes": coalesce(voiceTypes[]->name, [])
    }, [])
  }, []),
  "verseLines": coalesce(verseLines, [])
`

    const SONGS_QUERY = `*[_type == "song"] | order(title asc) { ${SONG_FIELDS} }`
    const SONG_BY_SLUG_QUERY = `*[_type == "song" && (slug.current == $slug || _id == $slug)][0] { ${SONG_FIELDS} }`
    const PLAYLISTS_QUERY = `*[_type == "playlist"] | order(title asc) {
  _id,
  "slug": coalesce(slug.current, _id),
  title,
  "songs": coalesce(songs[]->{ ${SONG_FIELDS} }, [])
}`
const PLAYLIST_BY_SLUG_QUERY = `*[_type == "playlist" && (slug.current == $slug || _id == $slug)][0] {
  _id,
  "slug": coalesce(slug.current, _id),
  title,
  "songs": coalesce(songs[]->{ ${SONG_FIELDS} }, [])
}`

async function withSanityFallback<T>(
  queryFn: (sanity: NonNullable<typeof client>) => Promise<T>,
  fallback: T
): Promise<T> {
  if (!client) return fallback
  try {
    return await queryFn(client)
  } catch (error) {
    console.error('Error fetching from Sanity:', error)
    return fallback
  }
}

export async function getHomeData(): Promise<{
  songs: Song[]
  playlists: Playlist[]
  isConfigured: boolean
}> {
  return withSanityFallback<{
    songs: Song[]
    playlists: Playlist[]
    isConfigured: boolean
  }>(
    async (sanity) => {
      const [songs, playlists] = await Promise.all([
        sanity.fetch<Song[]>(SONGS_QUERY),
        sanity.fetch<Playlist[]>(PLAYLISTS_QUERY),
      ])
      return {
        songs: songs || [],
        playlists: playlists || [],
        isConfigured: true,
      }
    },
    { songs: DEMO_SONGS, playlists: DEMO_PLAYLISTS, isConfigured: false }
  )
}

export async function getSongBySlug(slug: string): Promise<Song | null> {
  return withSanityFallback(
    (sanity) => sanity.fetch<Song | null>(SONG_BY_SLUG_QUERY, { slug }),
    DEMO_SONGS.find((s) => s.slug === slug) ?? null
  )
}

export async function getPlaylistBySlug(
  slug: string
): Promise<Playlist | null> {
  return withSanityFallback(
    (sanity) =>
      sanity.fetch<Playlist | null>(PLAYLIST_BY_SLUG_QUERY, { slug }),
    DEMO_PLAYLISTS.find((p) => p.slug === slug) ?? null
  )
}
