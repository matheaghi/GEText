import { CHOIR_VOICE_TYPE_NAME } from '../constants'
import type { Playlist, Song } from './queries'

export const DEMO_VOICE_TYPES = [
  CHOIR_VOICE_TYPE_NAME,
  'Soprano 1',
  'Alto',
  'Bass',
  'Lead',
]

export const DEMO_SONGS: Song[] = [
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

export const DEMO_PLAYLISTS: Playlist[] = [
  {
    _id: 'demo-playlist-1',
    slug: 'friday-night-gig-demo',
    title: 'Friday Night Gig (Demo)',
    songs: DEMO_SONGS,
  },
]
