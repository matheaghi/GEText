import { CHOIR_VOICE_TYPE_NAME } from '../constants'
import { client } from './client'

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
  if (song.verses && song.verses.length > 0) {
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

  return (song.verseLines ?? []).map((text) => ({
    text,
    voiceTypes: [CHOIR_VOICE_TYPE_NAME],
  }))
}

export function formatSongSummary(song: Song): string {
  const lineCount = expandSongLines(song).length
  const verseCount = song.verses?.length ?? 0
  const linesLabel = `${lineCount} ${lineCount === 1 ? 'line' : 'lines'}`
  if (verseCount > 0) {
    return `${verseCount} ${verseCount === 1 ? 'verse' : 'verses'} · ${linesLabel}`
  }
  return linesLabel
}

const DEMO_VOICE_TYPES = [
  CHOIR_VOICE_TYPE_NAME,
  'Soprano 1',
  'Alto',
  'Bass',
  'Lead',
]

const DEMO_SONGS: Song[] = [
  {
    _id: 'demo-1',
    slug: 'amazing-grace-demo',
    title: 'Amazing Grace (Demo)',
    verses: [
      {
        name: 'Verse 1',
        voiceTypes: ['Lead'],
        verseLines: [
          { text: 'Amazing grace! How sweet the sound', voiceTypes: [] },
          { text: 'That saved a wretch like me!', voiceTypes: [] },
          { text: 'I once was lost, but now am found;', voiceTypes: [] },
          { text: 'Was blind, but now I see.', voiceTypes: [] },
        ],
      },
      {
        name: 'Verse 2',
        voiceTypes: [],
        verseLines: [
          { text: "'Twas grace that taught my heart to fear,", voiceTypes: [] },
          { text: 'And grace my fears relieved;', voiceTypes: [] },
          { text: 'How precious did that grace appear', voiceTypes: [] },
          { text: 'The hour I first believed.', voiceTypes: [] },
        ],
      },
    ],
  },
  {
    _id: 'demo-2',
    slug: 'stand-by-me-demo',
    title: 'Stand By Me (Demo)',
    verses: [
      {
        name: 'Verse 1',
        voiceTypes: ['Bass'],
        verseLines: [
          { text: 'When the night has come', voiceTypes: [] },
          { text: 'And the land is dark', voiceTypes: [] },
          { text: 'And the moon is the only light we’ll see', voiceTypes: [] },
          { text: 'No, I won’t be afraid', voiceTypes: [] },
          { text: 'Oh, I won’t be afraid', voiceTypes: ['Bass', 'Alto'] },
        ],
      },
      {
        name: 'Chorus',
        voiceTypes: [],
        verseLines: [
          { text: 'So darlin’, darlin’, stand by me', voiceTypes: [] },
          { text: 'Oh, stand by me', voiceTypes: [] },
          { text: 'Oh, stand, stand by me, stand by me', voiceTypes: [] },
        ],
      },
    ],
  },
]

const DEMO_PLAYLISTS: Playlist[] = [
  {
    _id: 'demo-playlist-1',
    slug: 'friday-night-gig-demo',
    title: 'Friday Night Gig (Demo)',
    songs: DEMO_SONGS,
  },
]

const SONG_FIELDS = `
  _id,
  "slug": coalesce(slug.current, _id),
  title,
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

const SONGS_QUERY = `*[_type == "song"] | order(title asc) {
  ${SONG_FIELDS}
}`

const SONG_BY_SLUG_QUERY = `*[_type == "song" && (slug.current == $slug || _id == $slug)][0] {
  ${SONG_FIELDS}
}`

const PLAYLISTS_QUERY = `*[_type == "playlist"] | order(title asc) {
  _id,
  "slug": coalesce(slug.current, _id),
  title,
  "songs": coalesce(songs[]->{
    ${SONG_FIELDS}
  }, [])
}`

const PLAYLIST_BY_SLUG_QUERY = `*[_type == "playlist" && (slug.current == $slug || _id == $slug)][0] {
  _id,
  "slug": coalesce(slug.current, _id),
  title,
  "songs": coalesce(songs[]->{
    ${SONG_FIELDS}
  }, [])
}`

const VOICE_TYPES_QUERY = `*[_type == "voiceType"] | order(name asc).name`

export async function getHomeData(): Promise<{
  songs: Song[]
  playlists: Playlist[]
  isConfigured: boolean
}> {
  if (!client) {
    return { songs: DEMO_SONGS, playlists: DEMO_PLAYLISTS, isConfigured: false }
  }
  try {
    const [songs, playlists] = await Promise.all([
      client.fetch<Song[]>(SONGS_QUERY),
      client.fetch<Playlist[]>(PLAYLISTS_QUERY),
    ])
    return {
      songs: songs || [],
      playlists: playlists || [],
      isConfigured: true,
    }
  } catch (error) {
    console.error('Error fetching from Sanity:', error)
    return { songs: DEMO_SONGS, playlists: DEMO_PLAYLISTS, isConfigured: false }
  }
}

export async function getSongBySlug(slug: string): Promise<{
  song: Song | null
  voiceTypes: string[]
}> {
  if (!client) {
    return {
      song: DEMO_SONGS.find((s) => s.slug === slug) ?? null,
      voiceTypes: DEMO_VOICE_TYPES,
    }
  }
  try {
    const [song, voiceTypes] = await Promise.all([
      client.fetch<Song | null>(SONG_BY_SLUG_QUERY, { slug }),
      client.fetch<string[]>(VOICE_TYPES_QUERY),
    ])
    return { song, voiceTypes: voiceTypes || [] }
  } catch (error) {
    console.error('Error fetching song from Sanity:', error)
    return {
      song: DEMO_SONGS.find((s) => s.slug === slug) ?? null,
      voiceTypes: DEMO_VOICE_TYPES,
    }
  }
}

export async function getPlaylistBySlug(slug: string): Promise<{
  playlist: Playlist | null
  voiceTypes: string[]
}> {
  if (!client) {
    return {
      playlist: DEMO_PLAYLISTS.find((p) => p.slug === slug) ?? null,
      voiceTypes: DEMO_VOICE_TYPES,
    }
  }
  try {
    const [playlist, voiceTypes] = await Promise.all([
      client.fetch<Playlist | null>(PLAYLIST_BY_SLUG_QUERY, { slug }),
      client.fetch<string[]>(VOICE_TYPES_QUERY),
    ])
    return { playlist, voiceTypes: voiceTypes || [] }
  } catch (error) {
    console.error('Error fetching playlist from Sanity:', error)
    return {
      playlist: DEMO_PLAYLISTS.find((p) => p.slug === slug) ?? null,
      voiceTypes: DEMO_VOICE_TYPES,
    }
  }
}
