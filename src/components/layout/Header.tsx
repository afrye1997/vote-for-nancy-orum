import { LinkButton } from '../ui/Button'
import { IMAGES, imgSources } from '../../content/images'
import { DONATE_URL } from '../../content/election'
import { NAV_PAGES, href } from '../../content/site'

/**
 * The overlaid header.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THREE SURFACES, ONE FILE — 2026-09-02
 * ─────────────────────────────────────────────────────────────────────────────
 * This used to carry two cuts of the old lockup and choose between them per
 * page, plus a third choice at narrow widths. All of that existed for one
 * reason: the old mark was ink with nothing behind it, so it was legible on
 * exactly one kind of surface and disappeared on the other. Measured over the
 * two hero photographs, 99.7% of the navy cut's ink fell below 4.5:1.
 *
 * The 2026 mark is a painted sign, opaque edge to edge. It carries its own
 * background, so it reads the same over a photograph, over the pale pages, and
 * on the light bar the header becomes below 900px. One file, no swap, no
 * media-query cut, and `tone` now decides only the colour of the links beside
 * it.
 *
 * The per-page table in HANDOFF.md under "Decisions that must not be quietly
 * reversed" described the old swap and no longer applies to the logo. The rule
 * behind it still does, for the LINKS: which treatment survives over a
 * photograph is a property of the picture, not of this file, so re-measure
 * rather than assume if a hero is ever swapped.
 */
/**
 * `tone` was a prop here until 2026-09-02 and no longer is. It chose between two
 * cuts of the old lockup; the painted mark needs no choosing. The links still
 * change with the surface, but that has always come from `.site--dark` on the
 * wrapper (layout.css) rather than from anything passed in here.
 */
export function Header({
  base,
  current,
}: {
  readonly base: string
  readonly current: string
}) {
  const logo = IMAGES.navBanner
  const mark = imgSources(base, logo)
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="site-header__logo" href={href(base, '')}>
          <picture>
            <source srcSet={mark.avif} type="image/avif" />
            <img
              src={mark.fallback}
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
