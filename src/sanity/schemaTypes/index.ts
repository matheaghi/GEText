import { type SchemaTypeDefinition } from 'sanity'
import { songType } from './song'
import { playlistType } from './playlist'
import { verseType } from './verse'
import { verseLineType } from './verseLine'
import { voiceType } from './voiceType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [songType, playlistType, verseType, verseLineType, voiceType],
}
