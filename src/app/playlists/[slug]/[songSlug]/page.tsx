import { notFound } from 'next/navigation'
import SongRehearsalView from '@/components/SongRehearsalView'
import { getPlaylistBySlug } from '@/sanity/lib/queries'

export const dynamic = 'force-dynamic'

export default async function PlaylistSongPage({
  params,
}: {
  params: Promise<{ slug: string; songSlug: string }>
}) {
  const { slug, songSlug } = await params
  const decodedPlaylistSlug = decodeURIComponent(slug)
  const decodedSongSlug = decodeURIComponent(songSlug)

  const playlist = await getPlaylistBySlug(decodedPlaylistSlug)

  if (!playlist) {
    notFound()
  }

  const songIndex = playlist.songs.findIndex(
    (s) => s.slug === decodedSongSlug || s._id === decodedSongSlug
  )

  if (songIndex === -1) {
    notFound()
  }

  const song = playlist.songs[songIndex]
  const next =
    songIndex + 1 < playlist.songs.length
      ? playlist.songs[songIndex + 1]
      : null

  return (
    <SongRehearsalView
      song={song}
      backHref={`/playlists/${encodeURIComponent(playlist.slug)}`}
      backLabel={playlist.title}
      playlistTitle={playlist.title}
      nextSong={
        next
          ? {
              title: next.title,
              href: `/playlists/${encodeURIComponent(playlist.slug)}/${encodeURIComponent(next.slug)}`,
            }
          : null
      }
    />
  )
}
