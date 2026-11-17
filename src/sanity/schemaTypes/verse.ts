import { defineField, defineType } from 'sanity'

export const verseType = defineType({
  name: 'verse',
  title: 'Verse',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      description: 'e.g. Verse 1, Chorus 1, Bridge',
      type: 'string',
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
    select: {
      name: 'name',
      verseLines: 'verseLines',
    },
    prepare({ name, verseLines }) {
      const count = Array.isArray(verseLines) ? verseLines.length : 0
      return {
        title: name || 'Unnamed Verse',
        subtitle: `${count} line${count === 1 ? '' : 's'}`,
      }
    },
  },
})
