import { defineField, defineType } from 'sanity'

export const voiceType = defineType({
  name: 'voiceType',
  title: 'Voice Type',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      description: 'e.g. Choir, Soprano 1, Bass, Lead',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'name' },
    prepare({ title }) {
      return {
        title: title || 'Unnamed Voice Type',
      }
    },
  },
})
