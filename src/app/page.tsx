import HomeListView from '@/components/HomeListView'
import { getHomeData } from '@/sanity/lib/queries'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const { songs, playlists, isConfigured } = await getHomeData()
  return (
    <HomeListView
      songs={songs}
      playlists={playlists}
      isConfigured={isConfigured}
    />
  )
}
