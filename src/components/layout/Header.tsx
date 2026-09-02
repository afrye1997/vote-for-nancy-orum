import { LinkButton } from '../ui/Button'
import { IMAGES, imgSources } from '../../content/images'
import { DONATE_URL } from '../../content/election'
import { NAV_PAGES, href } from '../../content/site'

/**
 * The overlaid header.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THREE SURFACES, TWO CUTS OF ONE MARK
 * ─────────────────────────────────────────────────────────────────────────────
 * The campaign supplied the 2026 lockup twice on 2026-09-02: "NANCY", the rules
 * and the banner in white for the photographic pages, the same in navy for the
 * pale ones, with the watercolour "ORUM" common to both. So the header chooses,
 * and the mapping is the campaign's:
 *
 *   white cut   home, get involved — the two pages that open on a photograph
 *   navy cut    about nancy, platform — the two that open on frost
 *
 * This is the arrangement the OLD lockup had, and it is back for the same
 * reason: a knockout is ink with nothing behind it, so it is legible on exactly
 * one kind of surface. Measured over the two hero photographs, 99.7% of the old
 * navy cut's ink fell below 4.5:1. If a hero photograph is ever swapped,
 * re-measure rather than assume — which cut wins is a property of the picture
 * behind it, not of anything in this file.
 *
 * (Between those two arrangements the header briefly wore an opaque painted sign
 * that needed no choosing at all. It came off because opaque artwork in that
 * corner needs a rounded edge and a shadow to look bounded, and with both it
 * reads as a picture stuck to the page rather than as the site's mark.)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE THIRD CASE THE MOCKUP NEVER HAD
 * ─────────────────────────────────────────────────────────────────────────────
 * Below 900px the header stops overlaying the artwork and becomes a light bar in
 * the flow. A dark page's white cut is then white type on a white bar — right
 * further up the page, wrong here. The `<source media>` pair swaps the navy cut
 * back in at that width, so `tone` decides the desktop surface and the media
 * query decides the narrow one.
 *
 * Rendering both and hiding one with CSS would download both. `<picture>` picks
 * the first matching source and fetches only that. Both cuts share one crop box,
 * so the swap cannot resize the logo — see images.ts.
 */
export function Header({
  base,
  current,
  tone,
}: {
  readonly base: string
  readonly current: string
  /** Which surface the header sits on, which decides the cut and the links. */
  readonly tone: 'dark' | 'light'
}) {
  const logo = tone === 'dark' ? IMAGES.navLogoWhite : IMAGES.navLogoNavy
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
