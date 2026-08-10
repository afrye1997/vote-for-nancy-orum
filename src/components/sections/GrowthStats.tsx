import { useEffect, useRef, useState } from 'react'
import { CountUp } from '../ui/CountUp'
import { GROWTH_INTRO, STATS } from '../../content/growth'

/**
 * The three growth figures.
 *
 * Every number and every attribution comes from `growth.ts`, which was rebuilt
 * against primary Census files after three of the four figures in the original
 * artifact failed fact-checking. The mockup still carries the old ones — 33,274
 * residents, 30,102 in 2020, permits "roughly fifteen times the 2013 pace",
 * against a year the city reported no permit data at all. None of those strings
 * may appear in the built output; scripts/prerender.mjs fails the build if they
 * do. That check is the reason this section reads from the module instead of
 * from the design.
 *
 * Each attribution is a real link, per the rendering contract documented beside
 * `STAT_SOURCE_LINKS_REQUIRED`: underlined, not colour alone, and pointing at a
 * page a non-technical visitor can actually read.
 */
export function GrowthStats() {
  const statsRef = useRef<HTMLDivElement>(null)
  const [counting, setCounting] = useState(false)

  /**
   * One observer for the whole row, so all three counters start on the same
   * frame and — running for the same duration — land on the same frame. Each
   * counter watching itself only looked synchronised while they shared a line;
   * stacked into one column on a phone they fired one at a time.
   *
   * `false` on the server and on the first client render, so hydration matches.
   */
  useEffect(() => {
    const el = statsRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer.disconnect()
        setCounting(true)
      },
      { threshold: 0.4 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="section container" style={{ paddingTop: 0 }}>
      <div className="section__head section__head--growth">
        <p className="eyebrow">{GROWTH_INTRO.eyebrow}</p>
        <h2 className="section__title">{GROWTH_INTRO.heading}</h2>
        <p className="section__lede">{GROWTH_INTRO.lede}</p>
      </div>
      <div className="stats" ref={statsRef}>
        {STATS.map((stat) => (
          <div className="stat" key={stat.id}>
            <p className="stat__figure">
              <CountUp
                from={stat.countFrom}
                to={stat.value}
                suffix={stat.suffix}
                start={counting}
              />
            </p>
            <p className="stat__caption">{stat.caption}</p>
            <p className="stat__source">
              <a href={stat.sourceUrl} target="_blank" rel="noopener noreferrer">
                {stat.source}
              </a>
            </p>
          </div>
        ))}
      </div>
      <p className="stats__note">{GROWTH_INTRO.note}</p>
    </section>
  )
}
