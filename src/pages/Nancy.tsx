import { Page } from '../components/layout/Page'
import { AboutIntro } from '../components/sections/AboutIntro'
import { Biography } from '../components/sections/Biography'
import { RootedBand } from '../components/sections/RootedBand'
import { Strengths } from '../components/sections/Strengths'

/**
 * About Nancy.
 *
 * The mockup's About screen — portrait and intro, the four "what I bring to the
 * table" cards, the photographic band — plus her biography, which the mockup did
 * not have.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY <Biography /> IS BACK, 2026-09-02
 * ─────────────────────────────────────────────────────────────────────────────
 * It was here once. It was removed on the reasoning that the design does not
 * have it and the design is the specification, and that reasoning was wrong in a
 * way that took a month to surface.
 *
 * NEEDED-FROM-CAMPAIGN.md §3 asked the candidate for a "Why I am running"
 * section, and called it "the only part of the site with no content at all."
 * That was false the whole time. She sent 591 words on 2026-08-04 — her roots
 * here, her twenty years teaching, her move into real estate, her credo, and the
 * sentence "I am running for City Council because I believe Bella Vista's best
 * days are still ahead of us." All of it sat in bio.ts, verbatim and unpublished,
 * while the handoff notes went on asking her to write it.
 *
 * She noticed before we did. Asked again for the section, she answered: "I
 * thought we had a why am i running part." She was right, and this is the one
 * line that was standing between her words and the page.
 *
 * The lesson worth keeping: a layout drawn before the copy arrives is not a
 * specification for what the copy is allowed to be.
 */
export function Nancy({ base }: { readonly base: string }) {
  return (
    <Page base={base} current="nancy" tone="light">
      <AboutIntro base={base} />
      <Strengths />
      <Biography />
      <RootedBand base={base} />
    </Page>
  )
}
