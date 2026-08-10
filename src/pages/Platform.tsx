import { Page } from '../components/layout/Page'
import { PlatformRail } from '../components/sections/PlatformRail'

export function Platform({ base }: { readonly base: string }) {
  return (
    <Page base={base} current="platform" tone="light">
      <PlatformRail base={base} />
    </Page>
  )
}
