import type { ReactNode } from 'react'
import { CtaBand } from './CtaBand'
import { Footer } from './Footer'
import { Header } from './Header'

/**
 * The shell every page renders into: skip link, overlaid header, main landmark,
 * closing call to action, footer.
 *
 * `tone` says what the header sits on. Home and Get involved open with
 * full-bleed photography and let the artwork run up behind it; the other pages
 * are light, so the header takes navy type and `main` starts below it.
 *
 * It is both applied here AND passed down, and both are load-bearing. The
 * `.site--dark` / `.site--light` class is what colours the nav links, in CSS.
 * The prop is what lets `Header` pick between the two cuts of the lockup and
 * decide whether the ≤900px `<source>` pair is needed at all — see the note
 * there, and the per-page measurements in HANDOFF.md under "Decisions that
 * must not be quietly reversed".
 *
 * ⚠ The prop is therefore not redundant with the class, however much it looks
 * it. Dropping it puts the navy lockup on the two photographic heroes, where
 * 99.7% of its ink measured below 4.5:1 over Get involved.
 */
export function Page({
  base,
  current,
  tone,
  children,
}: {
  readonly base: string
  readonly current: string
  readonly tone: 'dark' | 'light'
  readonly children: ReactNode
}) {
  return (
    <div className={`site site--${tone}`}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header base={base} current={current} tone={tone} />
      <main className={tone === 'light' ? 'site__main site__main--offset' : 'site__main'} id="main">
        {children}
      </main>
      <CtaBand base={base} />
      <Footer base={base} />
    </div>
  )
}
