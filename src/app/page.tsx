import RehearsalApp, { Playlist, Song } from '@/components/RehearsalApp'
import { client } from '@/sanity/lib/client'

export const dynamic = 'force-dynamic'

const DEMO_SONGS: Song[] = [
  {
    _id: 'demo-1',
    title: 'Amazing Grace (Demo)',
    verses: [
      {
        name: 'Verse 1',
        verseLines: [
          'Amazing grace! How sweet the sound',
          'That saved a wretch like me!',
          'I once was lost, but now am found;',
          'Was blind, but now I see.',
        ],
      },
      {
        name: 'Verse 2',
        verseLines: [
          "'Twas grace that taught my heart to fear,",
          'And grace my fears relieved;',
          'How precious did that grace appear',
          'The hour I first believed.',
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
        verseLines: [
          'When the night has come',
          'And the land is dark',
          'And the moon is the only light we’ll see',
          'No, I won’t be afraid',
          'Oh, I won’t be afraid',
        ],
      },
      {
        name: 'Chorus',
        verseLines: [
          'So darlin’, darlin’, stand by me',
          'Oh, stand by me',
          'Oh, stand, stand by me, stand by me',
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
    "verseLines": coalesce(verseLines, [])
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

export default async function HomePage() {
  if (!client) {
    return (
      <RehearsalApp
        songs={DEMO_SONGS}
        playlists={DEMO_PLAYLISTS}
        isConfigured={false}
      />
    )
  }

  try {
    const [songs, playlists] = await Promise.all([
      client.fetch<Song[]>(SONGS_QUERY),
      client.fetch<Playlist[]>(PLAYLISTS_QUERY),
    ])

    return (
      <RehearsalApp
        songs={songs || []}
        playlists={playlists || []}
        isConfigured={true}
      />
    )
  } catch (error) {
    console.error('Error fetching from Sanity:', error)
    return (
      <RehearsalApp
        songs={DEMO_SONGS}
        playlists={DEMO_PLAYLISTS}
        isConfigured={false}
      />
    )
  }
}
