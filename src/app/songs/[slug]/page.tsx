import { notFound } from 'next/navigation'
import SongRehearsalView from '@/components/SongRehearsalView'
import { getSongBySlug } from '@/sanity/lib/queries'

export const dynamic = 'force-dynamic'

export default async function SongPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { song, voiceTypes } = await getSongBySlug(decodeURIComponent(slug))

  if (!song) {
    notFound()
  }

  return (
    <SongRehearsalView
      song={song}
      voiceTypes={voiceTypes}
      backHref="/"
      backLabel="Songs"
    />
  )
}
