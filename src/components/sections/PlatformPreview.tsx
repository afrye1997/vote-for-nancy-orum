import { LinkButton } from '../ui/Button'
import { COMMITMENTS, PLATFORM_PREVIEW } from '../../content/platform'
import { href } from '../../content/site'

/**
 * The six commitments in brief, linking through to the platform page.
 *
 * Each card is a single link wrapping both faces, rather than a card with a
 * link inside it. The whole card is the target a pointer expects to be able to
 * hit, and one link per card means a screen reader announces six destinations
 * here instead of twelve overlapping ones.
 *
 * The destination is that commitment's own section — `#commitment-01` and so on
 * — not the top of the platform page. Those ids are rendered by PlatformRail on
 * the real (non-clone) planks, and the rail's own index links already use them,
 * so this is an established target rather than a new contract.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BOTH FACES ARE ALWAYS IN THE DOM
 * ─────────────────────────────────────────────────────────────────────────────
 * The flip is a visual treatment, not a way of storing the back face until it
 * is needed. Front and back are both rendered, always, and the rotation only
 * decides which one is pointed at the viewer. So the link's accessible name is
 * the full "1. Listen first — Good leadership begins with listening" whether or
 * not anything is hovering, a crawler reads both halves, and with no CSS at all
 * the card degrades to a heading above a paragraph.
 *
 * sections.css keeps the flip behind `hover: hover` and `no-preference`; where
 * either fails, the two faces simply stack. See the note there.
 */
/**
 * Sets `cardAccent` in the campaign green wherever it appears in the title.
 *
 * Returns the title untouched when the word is not found, so rewording a title
 * costs the card a highlight rather than a heading. First occurrence only —
 * every accent is currently a word that appears once.
 */
function accentuate(title: string, accent: string) {
  const at = title.indexOf(accent)
  if (at < 0) return title
  return (
    <>
      {title.slice(0, at)}
      <span className="plank-card__accent">{accent}</span>
      {title.slice(at + accent.length)}
    </>
  )
}

export function PlatformPreview({ base }: { readonly base: string }) {
  return (
    <section className="section section--tinted">
      <div className="container">
        {/* Eyebrow and heading reveal together — they read as one line of type. */}
        <div className="reveal">
          <p className="eyebrow">{PLATFORM_PREVIEW.eyebrow}</p>
          <h2 className="section__title">{PLATFORM_PREVIEW.heading}</h2>
        </div>
        <ul className="plank-grid">
          {COMMITMENTS.map((commitment) => (
            <li className="reveal" key={commitment.id}>
              <a
                className="card plank-card"
                href={href(base, `platform/#commitment-${commitment.num}`)}
              >
                <span className="plank-card__face plank-card__face--front">
                  <h3 className="plank-card__title">
                    {accentuate(commitment.cardTitle, commitment.cardAccent)}
                  </h3>
                </span>
                <span className="plank-card__face plank-card__face--back">
                  <span className="plank-card__body">{commitment.lede}</span>
                  <span className="plank-card__cta" aria-hidden="true">
                    {PLATFORM_PREVIEW.cardCta}
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h13" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 26 }}>
          <LinkButton href={href(base, 'platform/')}>{PLATFORM_PREVIEW.cta}</LinkButton>
        </div>
      </div>
    </section>
  )
}
