import { notFound } from 'next/navigation'
import SongRehearsalView from '@/components/SongRehearsalView'
import { getSongBySlug, getSongVersions } from '@/sanity/lib/queries'

export const dynamic = 'force-dynamic'

export default async function SongPage({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params
  const songSlug = slug.map(decodeURIComponent).join('/')
  const song = await getSongBySlug(songSlug)

  if (!song) {
    notFound()
  }

  const versions = await getSongVersions(song)

  return (
    <SongRehearsalView
      song={song}
      versions={versions}
      versionBasePath="/songs"
      backHref="/"
      backLabel="Songs"
    />
  )
}
