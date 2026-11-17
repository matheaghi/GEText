'use client'

import { useEffect } from 'react'
import { definePlugin, type LayoutProps, useClient } from 'sanity'
import { apiVersion } from './env'
import { CHOIR_VOICE_TYPE_ID, CHOIR_VOICE_TYPE_NAME } from './constants'

function EnsureChoirLayout(props: LayoutProps) {
  const client = useClient({ apiVersion })

  useEffect(() => {
    client
      .createIfNotExists({
        _id: CHOIR_VOICE_TYPE_ID,
        _type: 'voiceType',
        name: CHOIR_VOICE_TYPE_NAME,
      })
      .catch(() => {
        // Ignore when unauthenticated (e.g. before Studio login)
      })
  }, [client])

  return props.renderDefault(props)
}

export const ensureChoirPlugin = definePlugin({
  name: 'ensure-choir-voice-type',
  studio: {
    components: {
      layout: EnsureChoirLayout,
    },
  },
})
