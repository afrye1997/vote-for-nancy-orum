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

/** How long the swipe hint stays up when nobody touches anything. */
const HINT_MS = 3600

/** The widths that lose the arrows, and so need the hint. Matches sections.css. */
const NARROW = '(max-width: 1100px)'

/**
 * …and a finger to swipe with.
 *
 * `any-pointer`, not `pointer`: a laptop with a touchscreen reports a mouse as
 * its primary pointer and still has a screen to swipe. The test is paired with
 * `navigator.maxTouchPoints` for the same reason — between them a phone cannot
 * miss out, and the cost of the pair being too generous is a hint on a device
 * that could also have dragged the rail with a mouse.
 *
 * A desktop browser window narrowed to phone width therefore does NOT show it.
 * Use the device toolbar in dev tools, which emulates touch, or a real phone.
 */
const TOUCH = '(any-pointer: coarse)'

type Slide = { commitment: Commitment; key: string; clone: boolean }

/**
 * Which of the six an incoming `platform/#commitment-NN` is asking for.
 *
 * The home page's flip cards and this page's own index links both use these
 * ids, and only the real (non-clone) planks carry them — `num` is a two-digit
 * string, `'01'`…`'06'`, so it is compared as written rather than parsed.
 *
 * Returns null for no hash, an unrecognised one, or an id belonging to
 * something else on the page, and the caller then centres the first card.
 */
function hashedCommitment(): number | null {
  const match = /^#commitment-(\d{2})$/.exec(window.location.hash)
  if (match === null) return null
  const index = COMMITMENTS.findIndex((commitment) => commitment.num === match[1])
  return index < 0 ? null : index
}

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
  const [hint, setHint] = useState(false)
  /** Set by the hint's effect, so anything that moves the rail can call it. */
  const dismissHint = useRef(() => {})

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

  /**
   * Once the clones exist, jump to the card the URL asked for — the first real
   * one when it asked for nothing. No animation either way.
   *
   * ───────────────────────────────────────────────────────────────────────────
   * THE HASH HAS TO BE READ HERE, BECAUSE THIS EFFECT OVERWRITES THE BROWSER
   * ───────────────────────────────────────────────────────────────────────────
   * This used to set `scrollLeft` to CLONES unconditionally, and every
   * `platform/#commitment-NN` deep link from the home page landed on the wrong
   * card because of it. The browser's own fragment scroll happens on the
   * six-card server render, before the clones are inserted; this then moves
   * `scrollLeft` out from under it, and `nearest()` resolves to whichever card
   * that leaves closest to the centre. Measured before the fix: `#commitment-03`
   * centred Commitment 02 and `#commitment-06` centred Commitment 05 — a
   * consistent off-by-one rather than a jump to the top of the rail.
   *
   * Centring the requested card here is also stable against a fragment scroll
   * that arrives afterwards: a browser scrolls a fragment into view with inline
   * alignment `nearest`, and a card sitting in the middle of the rail is
   * already fully in view, so there is nothing left for it to do.
   */
  useEffect(() => {
    if (!ready) return
    const rail = railRef.current
    const index = CLONES + (hashedCommitment() ?? 0)
    const left = offsetTo(index)
    if (rail && left !== null) rail.scrollLeft = left
    setCentre(index)
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

  /**
   * The swipe hint.
   *
   * Below 1100px the arrows are gone and the neighbouring cards are a sliver,
   * so nothing on the card says it moves. A pill fades in over the photograph
   * the first time the rail is scrolled into view, and leaves the moment a
   * finger lands on it — or after HINT_MS, for the visitor who reads it and
   * does nothing. Once per page load: the observer disconnects on its first
   * hit, so scrolling back up does not bring it round again.
   *
   * Dismissal is bound to the pointer rather than to the rail's scroll, because
   * the rail is scrolled programmatically — the jump onto the first real card,
   * and every index-pill tap — and those must not count as "they already know".
   * The pill-tap case is handled by `scrollToIndex` calling this instead.
   */
  useEffect(() => {
    const rail = railRef.current
    if (!rail || typeof IntersectionObserver === 'undefined') return
    const touch = window.matchMedia(TOUCH).matches || navigator.maxTouchPoints > 0
    if (!touch || !window.matchMedia(NARROW).matches) return

    let timer: ReturnType<typeof setTimeout>

    const dismiss = () => {
      clearTimeout(timer)
      setHint(false)
      rail.removeEventListener('pointerdown', dismiss)
      rail.removeEventListener('keydown', dismiss)
    }
    dismissHint.current = dismiss

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer.disconnect()
        setHint(true)
        timer = setTimeout(dismiss, HINT_MS)
        rail.addEventListener('pointerdown', dismiss, { passive: true })
        rail.addEventListener('keydown', dismiss)
      },
      /* A ratio would be the wrong test — a card is taller than a phone, so the
         rail can fill the screen and still never reach a threshold like 0.35.
         The bottom edge is pulled in instead: this fires when the top of the
         rail rises past 60% of the viewport, whatever the card's height. */
      { threshold: 0, rootMargin: '0px 0px -40% 0px' },
    )
    observer.observe(rail)

    return () => {
      observer.disconnect()
      dismiss()
    }
  }, [])

  const scrollToIndex = (index: number) => {
    const rail = railRef.current
    const left = offsetTo(index)
    dismissHint.current()
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
        <div className="reveal">
          <p className="eyebrow">{PLATFORM_INTRO.eyebrow}</p>
          <h1 className="section__title">
            {PLATFORM_INTRO.headingLead}{' '}
            <span className="rail-head__emphasis">{PLATFORM_INTRO.headingEmphasis}</span>
          </h1>
          <p className="section__lede rail-head__lede">{PLATFORM_INTRO.lede}</p>
        </div>
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
        {/*
          Decorative, and hidden from screen readers on purpose: "swipe" is not
          the gesture a screen-reader user makes here, and the rail is already
          reachable by the index links and by the keyboard.
        */}
        <p className="rail-hint" data-show={hint ? '' : undefined} aria-hidden="true">
          <svg
            className="rail-hint__glyph"
            width="50"
            height="24"
            viewBox="0 0 50 24"
            aria-hidden="true"
          >
            {/* The two chevrons the hand travels between. */}
            <g
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 7 3 12l5 5" />
              <path d="M42 7l5 5-5 5" />
            </g>
            {/*
              A hand: three rounded boxes — index finger, fist, thumb — filled
              and overlapping, rather than an outline. At this size an outlined
              hand turns to mush, and it is the thumb that keeps the silhouette
              legible as a hand rather than a lollipop.

              The group is centred by its coordinates and not by a `transform`
              attribute, because the swipe animation drives `transform` on this
              same element and would overwrite it.
            */}
            <g className="rail-hint__hand" fill="currentColor">
              <rect x="22.8" y="1.5" width="4.2" height="12" rx="2.1" />
              <rect x="22" y="10" width="12" height="12" rx="4.6" />
              <rect
                x="18.4"
                y="11.5"
                width="3.6"
                height="7.5"
                rx="1.8"
                transform="rotate(-30 20.2 15.25)"
              />
            </g>
          </svg>
          <span>Swipe</span>
        </p>
        {/*
          The "5 / 6" readout was removed from the page at the campaign's
          request, 2026-08-11. The live region itself stays, hidden: it is the
          only thing that tells a screen-reader user where they have landed
          after pressing next, and the rail offers no other feedback — the cards
          scroll, which is silent.

          The wording is a sentence rather than "5 / 6" because it is now only
          ever heard, never read. "five slash six" is not what that meant.
        */}
        <p className="visually-hidden" aria-live="polite">
          Commitment {active + 1} of {REAL}
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
