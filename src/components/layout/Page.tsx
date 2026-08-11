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
 * It is applied here rather than passed down. The nav links need it, and they
 * read it off `.site--dark` / `.site--light` in CSS; the campaign sign in the
 * header brings its own background and looks the same on either surface, so
 * Header itself no longer has anything to decide.
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
