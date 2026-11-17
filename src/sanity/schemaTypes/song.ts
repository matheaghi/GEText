import { defineField, defineType } from 'sanity'

export const songType = defineType({
  name: 'song',
  title: 'Song',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'verseLines',
      title: 'Verse Lines',
      description: 'Each item in the list is one line of lyrics in order.',
      type: 'array',
      of: [{ type: 'string' }],
    }),
  ],
  preview: {
    select: { title: 'title', verseLines: 'verseLines' },
    prepare({ title, verseLines }) {
      const count = Array.isArray(verseLines) ? verseLines.length : 0
      return {
        title: title || 'Untitled Song',
        subtitle: `${count} line${count === 1 ? '' : 's'}`,
      }
    },
  },
})
