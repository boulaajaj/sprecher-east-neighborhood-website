import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas'
import { projectId, dataset, apiVersion } from './env'

export default defineConfig({
  name: 'sprecher-east',
  title: 'Sprecher East',
  projectId,
  dataset,
  apiVersion,
  basePath: '/studio',
  plugins: [
    structureTool(),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
  schema: {
    types: schemaTypes,
  },
})
