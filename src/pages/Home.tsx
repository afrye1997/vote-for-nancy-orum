import { Page } from '../components/layout/Page'
import { GrowthStats } from '../components/sections/GrowthStats'
import { Hero } from '../components/sections/Hero'
import { PlatformPreview } from '../components/sections/PlatformPreview'
import { PowerMessage } from '../components/sections/PowerMessage'

export function Home({ base }: { readonly base: string }) {
  return (
    <Page base={base} current="home" tone="dark">
      <Hero base={base} />
      <PowerMessage base={base} />
      <GrowthStats />
      <PlatformPreview base={base} />
    </Page>
  )
}
