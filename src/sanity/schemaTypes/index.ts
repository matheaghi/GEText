import { type SchemaTypeDefinition } from 'sanity'
import { songType } from './song'
import { playlistType } from './playlist'
import { verseType } from './verse'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [songType, playlistType, verseType],
}
