import { notFound } from 'next/navigation'
import SongRehearsalView from '@/components/SongRehearsalView'
import {
  encodeSlugPath,
  getPlaylistBySlug,
  getSongBySlug,
  getSongVersions,
} from '@/sanity/lib/queries'

export const dynamic = 'force-dynamic'

export default async function PlaylistSongPage({
  params,
}: {
  params: Promise<{ slug: string; songSlug: string[] }>
}) {
  const { slug, songSlug } = await params
  const decodedPlaylistSlug = decodeURIComponent(slug)
  const decodedSongSlug = songSlug.map(decodeURIComponent).join('/')

  const playlist = await getPlaylistBySlug(decodedPlaylistSlug)

  if (!playlist) {
    notFound()
  }

  const songIndex = playlist.songs.findIndex(
    (s) => s.slug === decodedSongSlug || s._id === decodedSongSlug
  )

  const song =
    songIndex !== -1
      ? playlist.songs[songIndex]
      : await getSongBySlug(decodedSongSlug)

  if (!song) {
    notFound()
  }

  const versions = await getSongVersions(song)
  const next =
    songIndex !== -1 && songIndex + 1 < playlist.songs.length
      ? playlist.songs[songIndex + 1]
      : null

  return (
    <SongRehearsalView
      song={song}
      versions={versions}
      versionBasePath={`/playlists/${encodeURIComponent(playlist.slug)}`}
      backHref={`/playlists/${encodeURIComponent(playlist.slug)}`}
      backLabel={playlist.title}
      playlistTitle={playlist.title}
      nextSong={
        next
          ? {
            title: next.title,
            href: `/playlists/${encodeURIComponent(playlist.slug)}/${encodeSlugPath(next.slug)}`,
          }
          : null
      }
    />
  )
}
