import { useEffect, useState } from 'react'

/**
 * A number that counts up to its value when it scrolls into view.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * IT RENDERS THE FINAL VALUE FIRST
 * ─────────────────────────────────────────────────────────────────────────────
 * Initial state is `to`, not `from`. That matters three times over: the server
 * renders the real figure, the first client render matches it so hydration
 * holds, and a visitor whose bundle never arrives reads the true number rather
 * than a decorative one frozen partway through.
 *
 * The animation then starts from `from` in an effect. These are published
 * statistics under a candidate's name — the truth is the default state and the
 * animation is the enhancement, not the other way round.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE CALLER OWNS THE TRIGGER
 * ─────────────────────────────────────────────────────────────────────────────
 * `start` is a prop rather than an IntersectionObserver inside this component.
 * When each counter watched itself, a row of them stayed in step only because
 * they happened to share a line — and below 900px the stats stack into one
 * column, so they fired one after another as you scrolled past each in turn.
 *
 * One observer on the group means every counter starts on the same frame and,
 * since they all run for DURATION_MS, lands on the same frame too. The distance
 * each travels differs; the time it takes does not.
 */

const DURATION_MS = 1500

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * THE SHAPE OF THE SECOND AND A HALF
 * ─────────────────────────────────────────────────────────────────────────────
 * One second of steady climb, then half a second of visible settling.
 *
 * A single ease-out over the whole run does not read that way. Ease-out cubic
 * is most of the way there long before the end, so the tail is not "slower" so
 * much as stopped — the digits sit still while the animation is technically
 * still running. Splitting the curve puts real movement in the first phase and
 * keeps the tail actually counting, just slowly.
 *
 * SLOW_AT is not a taste value. It is the fraction that makes the two pieces
 * hand off at the same speed: solving `SLOW_AT / SLOW_FROM = 3(1 - SLOW_AT) /
 * (1 - SLOW_FROM)` at SLOW_FROM = 2/3 gives exactly 6/7. Round it and the
 * number visibly stumbles at the seam — either braking to a stop and starting
 * again, or lurching faster into the phase that is supposed to be the slow one.
 *
 * Change DURATION_MS alone and the shape holds, because both constants are
 * fractions of the run rather than milliseconds. Change SLOW_FROM and SLOW_AT
 * has to be re-solved from the equation above or the seam will show. (This has
 * now been 3s/1s, 2s/0.5s and 1.5s/0.5s; each time only the two lines below
 * changed, and only SLOW_FROM ever forced a re-solve.)
 */
const SLOW_FROM = 2 / 3
const SLOW_AT = 6 / 7

/** Fraction of the distance covered at `t`, where `t` is 0→1 across DURATION_MS. */
function eased(t: number): number {
  if (t < SLOW_FROM) {
    /* Linear. The deceleration is the tail's job; doing any of it here is what
       flattens the handoff into a stall. */
    return (SLOW_AT * t) / SLOW_FROM
  }
  const p = (t - SLOW_FROM) / (1 - SLOW_FROM)
  return SLOW_AT + (1 - SLOW_AT) * (1 - (1 - p) ** 3)
}

/**
 * Thousands separators, computed rather than delegated to `toLocaleString`.
 *
 * Intl output can differ between the Node build and the browser depending on
 * which ICU data each was compiled with, and a single differing character in a
 * hydrated text node is a mismatch that discards the tree. This cannot drift.
 */
function group(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function CountUp({
  from,
  to,
  suffix = '',
  start,
}: {
  readonly from: number
  readonly to: number
  readonly suffix?: string
  /** Flip to true to run the count. Until then the final value is shown. */
  readonly start: boolean
}) {
  const [value, setValue] = useState(to)

  useEffect(() => {
    if (!start || from === to) return
    /* Respect the setting rather than animating a number at someone. */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    let startedAt = 0

    const tick = (now: number) => {
      if (!startedAt) startedAt = now
      const t = Math.min(1, (now - startedAt) / DURATION_MS)
      setValue(from + (to - from) * eased(t))
      if (t < 1) raf = requestAnimationFrame(tick)
    }

    setValue(from)
    raf = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(raf)
  }, [from, to, start])

  return (
    <span>
      {group(value)}
      {suffix}
    </span>
  )
}
