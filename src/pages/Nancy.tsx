import { Page } from '../components/layout/Page'
import { AboutIntro } from '../components/sections/AboutIntro'
import { RootedBand } from '../components/sections/RootedBand'
import { Strengths } from '../components/sections/Strengths'

/**
 * About Nancy.
 *
 * A 1:1 reproduction of the mockup's About screen: portrait and intro, the four
 * "what I bring to the table" cards, and the photographic band.
 *
 * Her full biography from bio.ts is deliberately NOT here. It was added at one
 * point on the reasoning that a page called "About Nancy" should carry the
 * seven hundred words she wrote about herself, and removed again because the
 * design does not have it and the design is the specification. The content is
 * still in bio.ts, still verbatim, and <Biography /> still exists — dropping it
 * back in below <Strengths /> is one line if the campaign wants it.
 */
export function Nancy({ base }: { readonly base: string }) {
  return (
    <Page base={base} current="nancy" tone="light">
      <AboutIntro base={base} />
      <Strengths />
      <RootedBand base={base} />
    </Page>
  )
}
