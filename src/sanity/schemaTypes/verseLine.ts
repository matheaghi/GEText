import { defineField, defineType } from 'sanity'

export const verseLineType = defineType({
  name: 'verseLine',
  title: 'Verse Line',
  type: 'object',
  fields: [
    defineField({
      name: 'text',
      title: 'Line',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'voiceTypes',
      title: 'Voice Types',
      description:
        'Optional: overrides the verse voice types for this line only. Leave empty to inherit from the verse (or Choir if the verse also has none).',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'voiceType' }] }],
    }),
  ],
  preview: {
    select: {
      text: 'text',
      v0: 'voiceTypes.0.name',
      v1: 'voiceTypes.1.name',
      v2: 'voiceTypes.2.name',
    },
    prepare({ text, v0, v1, v2 }) {
      const voices = [v0, v1, v2].filter(Boolean)
      return {
        title: text || 'Empty line',
        subtitle: voices.length > 0 ? voices.join(', ') : undefined,
      }
    },
  },
})
