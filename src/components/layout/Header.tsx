import { LinkButton } from '../ui/Button'
import { IMAGES, imgSources } from '../../content/images'
import { DONATE_URL } from '../../content/election'
import { NAV_PAGES, href } from '../../content/site'

/**
 * The overlaid header.
 *
 * The mockup switches between two logo files depending on which tab is open,
 * because the lockup has its gradient baked into the picture and cannot be
 * recoloured. That is a real constraint until a transparent mark arrives
 * (NEEDED-FROM-CAMPAIGN.md §8), so both files ship and the page picks one.
 *
 * There is a third case the mockup never had. Below 900px the header stops
 * overlaying the artwork and becomes a light bar in the flow, so a dark page's
 * lockup — white "NANCY", navy "ORUM" — is wrong there even though it is right
 * further up. The `<source media>` below swaps in the navy file at that width.
 *
 * The alternative, rendering both and hiding one, downloads both. `<picture>`
 * picks the first matching source and fetches only that.
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
          <LinkButton variant="accent" size="sm" href={href(base, 'involved/')}>
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
