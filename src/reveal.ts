/**
 * Scroll reveal.
 *
 * Every block marked `.reveal` in the markup fades and rises into place the
 * first time it enters the viewport, then stays put. One observer for the whole
 * document, targets unobserved as they fire.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE HIDING IS THE DANGEROUS HALF, NOT THE ANIMATING
 * ─────────────────────────────────────────────────────────────────────────────
 * A reveal is `opacity: 0` plus something that removes it later. Every way that
 * second half can fail to run leaves a campaign site that renders as a blank
 * column of nothing — so the hidden state is gated three deep and each gate
 * fails open:
 *
 *   1. The CSS only hides under `html.js`, and that class is set by an inline
 *      script in the document head (see scripts/prerender.mjs). No JavaScript,
 *      no class, no hiding — the prerendered HTML is fully legible on its own.
 *   2. That same inline script drops the class again at `load` if this module
 *      never announced itself. A bundle that 404s or throws on parse therefore
 *      un-hides the page instead of eating it. Module scripts are deferred and
 *      run before `load` fires, so the check cannot race a healthy bundle.
 *   3. The hidden state also sits behind `prefers-reduced-motion: no-preference`,
 *      and this module reveals everything outright under `reduce`.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THE ROOT IS EXTENDED UPWARDS INSTEAD OF UPWARDS BEING SPECIAL-CASED
 * ─────────────────────────────────────────────────────────────────────────────
 * A plain "reveal when it intersects" observer loses text, and it took a real
 * browser to see it: IntersectionObserver notifies on a change of intersection
 * STATE, not on every scroll. A block below the fold that ends up above the
 * fold without ever crossing it — an anchor jump to `involved/#involved-form`,
 * End, a restored scroll position, any programmatic scroll — goes from
 * not-intersecting to not-intersecting. No callback is delivered, and it stays
 * at `opacity: 0` for as long as the visitor is on the page. Measured on this
 * site before the fix: landing on the form anchor left 8 of 10 blocks
 * invisible, including the whole of the page above it.
 *
 * Checking `boundingClientRect.top < 0` inside the callback does not save it,
 * because the callback is what never runs.
 *
 * So the observation root is stretched far past the top of the viewport. Above
 * the fold is then INSIDE the root, which makes "scrolled past" an ordinary
 * intersection, delivered like any other. The bottom edge is still the real
 * viewport (less a margin), so blocks below the fold stay hidden until they are
 * scrolled to — the direction the reveal is supposed to work in.
 *
 * Only `opacity` and `transform` move, so a hidden block still occupies its
 * full height. Nothing reflows as blocks reveal, and an anchor lands in the
 * right place on a page whose text has not painted yet.
 */

/**
 * How far above the viewport still counts as "in view" for the purposes above.
 *
 * Needs only to exceed the tallest page on the site, since it is measured from
 * the viewport's top edge and a scroll can put at most one document's worth of
 * page above it. The longest here is a little under 3,000px; this is two orders
 * of magnitude clear of that, and costs nothing — the root is a rectangle, not
 * a thing that gets walked.
 */
const ABOVE = '200000px'

const READY_ATTR = 'data-reveals-ready'

/**
 * The whole of gate 2, and the reason this function is wrapped rather than
 * written straight into `startReveals`.
 *
 * `data-reveals-ready` is a promise to the inline head script that the hiding
 * will be undone, and setting it retires that script's bail-out for good. So it
 * may only be set once the promise has actually been kept — which means after
 * every target either carries `is-revealed` or is being watched by a live
 * observer, not before.
 *
 * An earlier version set it as its first statement, on the reasoning that a
 * throw still counted as "the bundle arrived". It did not: a throw anywhere
 * below disarmed the bail-out and left every `.reveal` block at `opacity: 0`
 * permanently — precisely the blank page the three gates exist to prevent.
 *
 * The `catch` is the error path that comment assumed and this file did not
 * have. It reveals everything outright, so a fault in the observer setup costs
 * the animation rather than the text, and only then is the attribute set.
 */
export function startReveals(): void {
  const root = document.documentElement
  try {
    observeReveals()
  } catch (error) {
    /* Worth a line in the console: this path means the page is legible but the
       reveals are not working, which is invisible from the outside. */
    console.error('[reveals] falling back to revealing everything', error)
    for (const el of document.querySelectorAll('.reveal')) el.classList.add('is-revealed')
  }
  root.setAttribute(READY_ATTR, '')
}

function observeReveals(): void {
  const targets = Array.from(document.querySelectorAll<HTMLElement>('.reveal'))
  if (targets.length === 0) return

  const reveal = (el: Element) => el.classList.add('is-revealed')

  const motionOk = window.matchMedia('(prefers-reduced-motion: no-preference)').matches
  if (!motionOk || typeof IntersectionObserver === 'undefined') {
    targets.forEach(reveal)
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        reveal(entry.target)
        observer.unobserve(entry.target)
      }
    },
    {
      /* Top: everything above the fold, per the note above. Bottom: pulled in
         by 8% so a block reveals once it is properly into the viewport rather
         than on its first pixel, which reads as arriving late. */
      rootMargin: `${ABOVE} 0px -8% 0px`,
      threshold: 0.05,
    },
  )

  targets.forEach((el) => observer.observe(el))
}
