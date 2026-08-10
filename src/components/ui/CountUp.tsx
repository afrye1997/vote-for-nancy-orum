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

const DURATION_MS = 3000

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
      /* Ease out cubic: quick off the mark, settles onto the real figure. */
      setValue(from + (to - from) * (1 - (1 - t) ** 3))
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
