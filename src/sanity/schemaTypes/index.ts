import { type SchemaTypeDefinition } from 'sanity'
import { songType } from './song'
import { playlistType } from './playlist'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [songType, playlistType],
}
