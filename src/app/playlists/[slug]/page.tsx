import { notFound } from 'next/navigation'
import PlaylistDetailView from '@/components/PlaylistDetailView'
import { getPlaylistBySlug } from '@/sanity/lib/queries'

export const dynamic = 'force-dynamic'

export default async function PlaylistPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { playlist } = await getPlaylistBySlug(decodeURIComponent(slug))

  if (!playlist) {
    notFound()
  }

  return <PlaylistDetailView playlist={playlist} />
}
