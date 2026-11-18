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
      name: 'verses',
      title: 'Verses',
      description: 'Ordered list of verses (each with a name and verse lines).',
      type: 'array',
      of: [{ type: 'verse' }],
    }),
    defineField({
      name: 'verseLines',
      title: 'Legacy Verse Lines',
      description: 'Deprecated: use Verses above instead.',
      type: 'array',
      of: [{ type: 'string' }],
      hidden: ({ value }) => !Array.isArray(value) || value.length === 0,
    }),
  ],
  preview: {
    select: { title: 'title', verses: 'verses', verseLines: 'verseLines' },
    prepare({ title, verses, verseLines }) {
      const verseList = Array.isArray(verses) ? verses : []
      if (verseList.length > 0) {
        const totalLines = verseList.reduce((sum, v) => {
          const lines = Array.isArray(v?.verseLines) ? v.verseLines.length : 0
          return sum + lines
        }, 0)
        return {
          title: title || 'Untitled Song',
          subtitle: `${verseList.length} verse${verseList.length === 1 ? '' : 's'} · ${totalLines} line${totalLines === 1 ? '' : 's'}`,
        }
      }
      const count = Array.isArray(verseLines) ? verseLines.length : 0
      return {
        title: title || 'Untitled Song',
        subtitle: `${count} line${count === 1 ? '' : 's'}`,
      }
    },
  },
})
