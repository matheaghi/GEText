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
      name: 'voiceTypes',
      title: 'Voice Types',
      description:
        'Optional: applies to all lines in this verse that have no voice types set. Leave empty for Choir (everyone).',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'voiceType' }] }],
    }),
    defineField({
      name: 'verseLines',
      title: 'Verse Lines',
      description: 'Each item in the list is one line of lyrics in order.',
      type: 'array',
      of: [{ type: 'verseLine' }],
    }),
  ],
  preview: {
    select: {
      name: 'name',
      verseLines: 'verseLines',
      v0: 'voiceTypes.0.name',
      v1: 'voiceTypes.1.name',
    },
    prepare({ name, verseLines, v0, v1 }) {
      const count = Array.isArray(verseLines) ? verseLines.length : 0
      const voices = [v0, v1].filter(Boolean)
      const voiceSuffix = voices.length > 0 ? ` · ${voices.join(', ')}` : ''
      return {
        title: name || 'Unnamed Verse',
        subtitle: `${count} line${count === 1 ? '' : 's'}${voiceSuffix}`,
      }
    },
  },
})
