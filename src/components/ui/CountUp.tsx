import { useEffect, useRef, useState } from 'react'

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
 */

const DURATION_MS = 1400

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
}: {
  readonly from: number
  readonly to: number
  readonly suffix?: string
}) {
  const [value, setValue] = useState(to)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || from === to) return
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

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer.disconnect()
        setValue(from)
        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )
    observer.observe(el)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [from, to])

  return (
    <span ref={ref}>
      {group(value)}
      {suffix}
    </span>
  )
}
