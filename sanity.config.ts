'use client'

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { apiVersion, dataset, projectId } from './src/sanity/env'
import { ensureChoirPlugin } from './src/sanity/ensureChoirPlugin'
import { schema } from './src/sanity/schemaTypes'

export default defineConfig({
  basePath: '/admin',
  projectId: projectId || 'missing-project-id',
  dataset,
  schema,
  plugins: [
    structureTool(),
    visionTool({ defaultApiVersion: apiVersion }),
    ensureChoirPlugin(),
  ],
})
