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
        source: (doc) => {
          const title = typeof doc.title === 'string' ? doc.title.trim() : ''
          const version =
            doc.original && typeof doc.versionName === 'string'
              ? doc.versionName.trim()
              : ''
          return version ? `${title}/${version}` : title
        },
        slugify: (input) =>
          input
            .split('/')
            .map((part) =>
              part
                .toLowerCase()
                .replace(/æ/g, 'ae')
                .replace(/ø/g, 'o')
                .replace(/å/g, 'a')
                .normalize('NFKD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
            )
            .filter(Boolean)
            .join('/')
            .slice(0, 96),
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'original',
      title: 'Original Song',
      description:
        'If this song is a version of another song, select the original song here.',
      type: 'reference',
      to: [{ type: 'song' }],
      options: {
        filter: ({ document }) => {
          const baseId = (document?._id || '').replace(/^drafts\./, '')
          return {
            filter: '!(_id in [$id, $draftId]) && !defined(original)',
            params: {
              id: baseId,
              draftId: `drafts.${baseId}`,
            },
          }
        },
      },
    }),
    defineField({
      name: 'versionName',
      title: 'Version Name',
      description: 'e.g. Acoustic, Choir version, Short edit',
      type: 'string',
      hidden: ({ document }) => !document?.original,
      validation: (rule) =>
        rule.custom((value, context) => {
          if (context.document?.original && !value?.trim()) {
            return 'Version Name is required when Original Song is set.'
          }
          return true
        }),
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
    select: {
      title: 'title',
      versionName: 'versionName',
      verses: 'verses',
      verseLines: 'verseLines',
    },
    prepare({ title, versionName, verses, verseLines }) {
      const verseList = Array.isArray(verses) ? verses : []
      const versionPrefix = versionName ? `${versionName} · ` : ''
      if (verseList.length > 0) {
        const totalLines = verseList.reduce((sum, v) => {
          const lines = Array.isArray(v?.verseLines) ? v.verseLines.length : 0
          return sum + lines
        }, 0)
        return {
          title: title || 'Untitled Song',
          subtitle: `${versionPrefix}${verseList.length} verse${verseList.length === 1 ? '' : 's'} · ${totalLines} line${totalLines === 1 ? '' : 's'}`,
        }
      }
      const count = Array.isArray(verseLines) ? verseLines.length : 0
      return {
        title: title || 'Untitled Song',
        subtitle: `${versionPrefix}${count} line${count === 1 ? '' : 's'}`,
      }
    },
  },
})
