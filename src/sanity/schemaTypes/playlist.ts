import { defineField, defineType } from 'sanity'

export const playlistType = defineType({
  name: 'playlist',
  title: 'Playlist',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Event / Playlist Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'songs',
      title: 'Songs',
      description: 'Ordered list of songs for this event.',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'song' }] }],
    }),
  ],
  preview: {
    select: { title: 'title', songs: 'songs' },
    prepare({ title, songs }) {
      const count = Array.isArray(songs) ? songs.length : 0
      return {
        title: title || 'Untitled Playlist',
        subtitle: `${count} song${count === 1 ? '' : 's'}`,
      }
    },
  },
})
