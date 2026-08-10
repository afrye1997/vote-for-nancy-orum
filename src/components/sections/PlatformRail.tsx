import { useEffect, useRef, useState } from 'react'
import { Photo } from '../ui/Photo'
import { COMMITMENTS, PLATFORM_INTRO, type Commitment } from '../../content/platform'
import { IMAGES, imgSources } from '../../content/images'

/**
 * The platform rail: a continuous loop, as the mockup has it.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW THE LOOP WORKS
 * ─────────────────────────────────────────────────────────────────────────────
 * There is no way to make a scroll container wrap around, so the mockup's trick
 * is used: render the last CLONES cards before the first, and the first CLONES
 * after the last. Twelve slides for six commitments. Scrolling past either end
 * lands on a clone that looks identical to the card it copies, and once the
 * scroll settles the container's `scrollLeft` is moved by exactly six cards —
 * putting you on the real card, with the same pixels under you, so the jump is
 * invisible.
 *
 * The teleport waits for the scroll to settle (`SETTLE_MS`). Moving scrollLeft
 * mid-gesture fights the user's finger.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT THE CLONES COST, AND WHAT IS DONE ABOUT IT
 * ─────────────────────────────────────────────────────────────────────────────
 * Duplicated DOM means a screen reader would meet six commitments as twelve,
 * and duplicate `id`s would break the in-page links. So clones are
 * `aria-hidden`, carry no `id`, and their images are decorative — the real six
 * remain the only addressable, announced copies.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WITHOUT JAVASCRIPT
 * ─────────────────────────────────────────────────────────────────────────────
 * The clones only make sense once something can centre the rail on the first
 * real card. Server-side, and up to the moment React takes over, `ready` is
 * false and the clones are not rendered — so a visitor without the bundle gets
 * the six commitments in order, scrollable, from the start. `ready` flips in an
 * effect, which is also what makes the first client render match the server's.
 */

/** Cards duplicated onto each end. Three is enough to cover the widest peek. */
const CLONES = 3
const REAL = COMMITMENTS.length
const SETTLE_MS = 150

type Slide = { commitment: Commitment; key: string; clone: boolean }

const REAL_SLIDES: Slide[] = COMMITMENTS.map((commitment, i) => ({
  commitment,
  key: `real-${i}`,
  clone: false,
}))

const LOOPED_SLIDES: Slide[] = [
  ...COMMITMENTS.slice(REAL - CLONES).map((commitment, i) => ({
    commitment,
    key: `head-${i}`,
    clone: true,
  })),
  ...REAL_SLIDES,
  ...COMMITMENTS.slice(0, CLONES).map((commitment, i) => ({
    commitment,
    key: `tail-${i}`,
    clone: true,
  })),
]

export function PlatformRail({ base }: { readonly base: string }) {
  const railRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  /** Index into the rendered slides, not into COMMITMENTS. */
  const [centre, setCentre] = useState(0)

  const slides = ready ? LOOPED_SLIDES : REAL_SLIDES
  /** Which of the six is showing, whichever copy of it is centred. */
  const active = ready ? (((centre - CLONES) % REAL) + REAL) % REAL : centre

  useEffect(() => {
    setReady(true)
  }, [])

  /** Distance between two adjacent cards: one card plus one gap. */
  const step = () => {
    const rail = railRef.current
    if (!rail || rail.children.length < 2) return 0
    const a = rail.children[0]!.getBoundingClientRect()
    const b = rail.children[1]!.getBoundingClientRect()
    return b.left - a.left
  }

  const offsetTo = (index: number) => {
    const rail = railRef.current
    const card = rail?.children[index]
    if (!rail || !card) return null
    const railBox = rail.getBoundingClientRect()
    const cardBox = card.getBoundingClientRect()
    /* Rects, not offsetLeft: `.rail-wrap` is positioned so the arrows can sit
       over the cards, which makes it the cards' offsetParent — offsetLeft would
       measure from the wrapper while scrollLeft measures from the rail. */
    return rail.scrollLeft + cardBox.left + cardBox.width / 2 - (railBox.left + rail.clientWidth / 2)
  }

  /** Once the clones exist, jump to the first real card without animating. */
  useEffect(() => {
    if (!ready) return
    const rail = railRef.current
    const left = offsetTo(CLONES)
    if (rail && left !== null) rail.scrollLeft = left
    setCentre(CLONES)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  /** Track the centred card, and close the loop once scrolling settles. */
  useEffect(() => {
    const rail = railRef.current
    if (!rail || !ready) return

    let frame = 0
    let settle: ReturnType<typeof setTimeout>

    const nearest = () => {
      const railBox = rail.getBoundingClientRect()
      const middle = railBox.left + rail.clientWidth / 2
      let index = 0
      let best = Infinity
      Array.from(rail.children).forEach((child, i) => {
        const box = child.getBoundingClientRect()
        const distance = Math.abs(box.left + box.width / 2 - middle)
        if (distance < best) {
          best = distance
          index = i
        }
      })
      return index
    }

    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setCentre(nearest()))
      clearTimeout(settle)
      settle = setTimeout(() => {
        const index = nearest()
        const width = step()
        if (!width) return
        /* Sitting on a clone: shift by exactly one full set. Same pixels. */
        if (index < CLONES) {
          rail.scrollLeft += REAL * width
          setCentre(index + REAL)
        } else if (index >= CLONES + REAL) {
          rail.scrollLeft -= REAL * width
          setCentre(index - REAL)
        }
      }, SETTLE_MS)
    }

    rail.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(settle)
      rail.removeEventListener('scroll', onScroll)
    }
  }, [ready])

  const scrollToIndex = (index: number) => {
    const rail = railRef.current
    const left = offsetTo(index)
    if (rail && left !== null) rail.scrollTo({ left, behavior: 'smooth' })
  }

  /** Jump to whichever copy of commitment `i` is nearest — never a long scroll. */
  const goToCommitment = (i: number) => {
    if (!ready) return
    const candidates = [i + CLONES, i + CLONES + REAL, i + CLONES - REAL]
    const target = candidates.reduce((best, c) =>
      Math.abs(c - centre) < Math.abs(best - centre) && c >= 0 && c < LOOPED_SLIDES.length ? c : best,
    )
    scrollToIndex(target)
  }

  return (
    <>
      <section className="section container rail-head">
        <p className="eyebrow">{PLATFORM_INTRO.eyebrow}</p>
        <h1 className="section__title">
          {PLATFORM_INTRO.headingLead}{' '}
          <span className="rail-head__emphasis">{PLATFORM_INTRO.headingEmphasis}</span>
        </h1>
        <p className="section__lede rail-head__lede">{PLATFORM_INTRO.lede}</p>
        <nav aria-label="Commitments">
          <ul className="rail-index">
            {COMMITMENTS.map((commitment, index) => (
              <li key={commitment.id}>
                <a
                  className="rail-index__link"
                  href={`#commitment-${commitment.num}`}
                  aria-current={index === active ? 'true' : undefined}
                  data-active={index === active ? '' : undefined}
                  onClick={(event) => {
                    if (!ready) return
                    event.preventDefault()
                    goToCommitment(index)
                  }}
                >
                  <span className="rail-index__num">{index + 1}</span>
                  <span className="rail-index__label">{commitment.pill}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </section>

      <div className="rail-wrap">
        <RailArrow direction="prev" onClick={() => scrollToIndex(centre - 1)} />
        <div className="rail" ref={railRef} tabIndex={0} role="group" aria-label="The six commitments">
          {slides.map((slide, index) => (
            <Plank
              base={base}
              slide={slide}
              key={slide.key}
              /* The mockup dims and shrinks everything but the centred card. */
              focused={index === centre}
            />
          ))}
        </div>
        <RailArrow direction="next" onClick={() => scrollToIndex(centre + 1)} />
        <p className="rail-counter" aria-live="polite">
          {active + 1} / {REAL}
        </p>
      </div>
    </>
  )
}

function RailArrow({
  direction,
  onClick,
}: {
  readonly direction: 'prev' | 'next'
  readonly onClick: () => void
}) {
  const prev = direction === 'prev'
  return (
    <button
      type="button"
      className={`rail-arrow rail-arrow--${direction}`}
      onClick={onClick}
      aria-label={prev ? 'Previous commitment' : 'Next commitment'}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {prev ? (
          <>
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </>
        ) : (
          <>
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
          </>
        )}
      </svg>
    </button>
  )
}

function Plank({
  base,
  slide,
  focused,
}: {
  readonly base: string
  readonly slide: Slide
  readonly focused: boolean
}) {
  const { commitment, clone } = slide
  return (
    <article
      className="plank"
      id={clone ? undefined : `commitment-${commitment.num}`}
      aria-hidden={clone ? true : undefined}
      data-focused={focused ? '' : undefined}
    >
      {commitment.image === null ? (
        <div className="plank__logo-frame">
          <Photo {...imgSources(base, IMAGES.logoLockup)} image={IMAGES.logoLockup} />
        </div>
      ) : (
        <Photo
          className="plank__media"
          {...imgSources(base, commitment.image)}
          image={commitment.image}
        />
      )}
      <div className="plank__body">
        <p className="eyebrow plank__eyebrow">Commitment {commitment.num}</p>
        <h2 className="plank__title">{commitment.title}</h2>
        <p className="plank__lede">{commitment.lede}</p>
        {commitment.paragraphs.map((text) => (
          <p className="plank__text" key={text.slice(0, 32)}>
            {text}
          </p>
        ))}
        <p className="plank__pull">{commitment.pull}</p>
      </div>
    </article>
  )
}
