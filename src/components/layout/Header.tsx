import { LinkButton } from '../ui/Button'
import { IMAGES, imgSources } from '../../content/images'
import { DONATE_URL } from '../../content/election'
import { NAV_PAGES, href } from '../../content/site'

/**
 * The overlaid header.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THREE SURFACES, TWO FILES
 * ─────────────────────────────────────────────────────────────────────────────
 * The lockup has its gradient baked into the picture and cannot be recoloured,
 * so the campaign supplied two cuts of it and the page picks one. This is the
 * mockup's own behaviour, and it is here because each file is legible on
 * exactly one kind of surface and unreadable on the other:
 *
 *   nav-logo.png       "NANCY", "BELLA VISTA, AR" and the paid-for line in
 *                      white, "ORUM" in navy with a white outline. Correct over
 *                      photography. On a pale surface its white lines vanish.
 *   nav-logo-navy.png  navy throughout. Correct on the pale pages. Measured
 *                      over the two hero photographs it is close to invisible —
 *                      99.7% of its ink fell below 4.5:1 on Get involved.
 *
 * Those numbers are in HANDOFF.md. If a hero photograph is ever swapped,
 * re-measure rather than assume; which file wins is a property of the picture
 * behind it, not of anything in this file.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE THIRD CASE THE MOCKUP NEVER HAD
 * ─────────────────────────────────────────────────────────────────────────────
 * Below 900px the header stops overlaying the artwork and becomes a light bar
 * in the flow. A dark page's lockup is then white type on a white bar — right
 * further up the page, wrong here. The `<source media>` pair swaps the navy
 * file back in at that width, so `tone` decides the desktop surface and the
 * media query decides the narrow one.
 *
 * Rendering both and hiding one with CSS would download both. `<picture>` picks
 * the first matching source and fetches only that.
 */
export function Header({
  base,
  current,
  tone,
}: {
  readonly base: string
  readonly current: string
  /** Which surface the header sits on, which decides the logo and link colour. */
  readonly tone: 'dark' | 'light'
}) {
  const logo = tone === 'dark' ? IMAGES.navLogoLight : IMAGES.navLogoNavy
  const wide = imgSources(base, logo)
  /** The mobile header is a light surface whatever the page's tone. */
  const narrow = imgSources(base, IMAGES.navLogoNavy)
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="site-header__logo" href={href(base, '')}>
          <picture>
            {tone === 'dark' ? (
              <>
                <source media="(max-width: 900px)" srcSet={narrow.avif} type="image/avif" />
                <source media="(max-width: 900px)" srcSet={narrow.fallback} />
              </>
            ) : null}
            <source srcSet={wide.avif} type="image/avif" />
            <img
              src={wide.fallback}
              alt={`${logo.alt} — home`}
              width={logo.width}
              height={logo.height}
              fetchPriority="high"
              decoding="sync"
            />
          </picture>
        </a>
        <nav className="site-nav" aria-label="Primary">
          {NAV_PAGES.map((page) => (
            <a
              key={page.id}
              className="site-nav__link"
              href={href(base, page.path)}
              aria-current={page.id === current ? 'page' : undefined}
            >
              {page.label}
            </a>
          ))}
          {/*
            Straight to the "How would you like to help?" field, not to the top
            of the Get involved page. `#help` is that select's own id, so the
            browser scrolls to it with no JavaScript at all; InvolvedForm then
            focuses it and opens the list where the browser permits.
          */}
          <LinkButton variant="accent" size="sm" href={href(base, 'involved/#help')}>
            Volunteer
          </LinkButton>
          {DONATE_URL === null ? (
            <LinkButton variant="primary" size="sm" href={href(base, 'donate/')}>
              Donate
            </LinkButton>
          ) : (
            <LinkButton variant="primary" size="sm" href={DONATE_URL} external>
              Donate
            </LinkButton>
          )}
        </nav>
      </div>
    </header>
  )
}
