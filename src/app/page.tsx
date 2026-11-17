import RehearsalApp, { Playlist, Song } from '@/components/RehearsalApp'
import { CHOIR_VOICE_TYPE_NAME } from '@/sanity/constants'
import { client } from '@/sanity/lib/client'

export const dynamic = 'force-dynamic'

const DEMO_VOICE_TYPES = [CHOIR_VOICE_TYPE_NAME, 'Soprano 1', 'Alto', 'Bass', 'Lead']

const DEMO_SONGS: Song[] = [
  {
    _id: 'demo-1',
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
    title: 'Friday Night Gig (Demo)',
    songs: DEMO_SONGS,
  },
]

const SONG_FIELDS = `
  _id,
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

const PLAYLISTS_QUERY = `*[_type == "playlist"] | order(title asc) {
  _id,
  title,
  "songs": coalesce(songs[]->{
    ${SONG_FIELDS}
  }, [])
}`

const VOICE_TYPES_QUERY = `*[_type == "voiceType"] | order(name asc).name`

export default async function HomePage() {
  if (!client) {
    return (
      <RehearsalApp
        songs={DEMO_SONGS}
        playlists={DEMO_PLAYLISTS}
        voiceTypes={DEMO_VOICE_TYPES}
        isConfigured={false}
      />
    )
  }

  try {
    const [songs, playlists, voiceTypes] = await Promise.all([
      client.fetch<Song[]>(SONGS_QUERY),
      client.fetch<Playlist[]>(PLAYLISTS_QUERY),
      client.fetch<string[]>(VOICE_TYPES_QUERY),
    ])

    return (
      <RehearsalApp
        songs={songs || []}
        playlists={playlists || []}
        voiceTypes={voiceTypes || []}
        isConfigured={true}
      />
    )
  } catch (error) {
    console.error('Error fetching from Sanity:', error)
    return (
      <RehearsalApp
        songs={DEMO_SONGS}
        playlists={DEMO_PLAYLISTS}
        voiceTypes={DEMO_VOICE_TYPES}
        isConfigured={false}
      />
    )
  }
}
