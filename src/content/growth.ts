/**
 * Growth statistics.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * EVERY NUMBER HERE WAS PULLED FROM A PRIMARY CENSUS DATA FILE AND PARSED.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * The original artifact's stats did not survive fact-checking. What was wrong:
 *
 *   "30,102 in 2020"        → WRONG. The 2020 census count is 30,104. The figure
 *                             30,102 appears in no Census product at all; it
 *                             traces to Wikipedia, while being labeled
 *                             "Census estimate".
 *   "~15x the 2013 pace"    → FABRICATED. The Census Building Permits Survey has
 *                             NO 2013 data for Bella Vista — the city reported
 *                             zero months that year. There is no denominator.
 *                             The comparison was invented.
 *   "636 permits"           → OFF BY ONE and misattributed. The federal figure is
 *                             637. No city document publishes 636, despite the
 *                             "City permit data" label.
 *   "33,274 residents"      → REAL but superseded. Vintage 2025 has since been
 *                             published; the current figure is 34,518.
 *   "became a city in 2006" → IMPRECISE. Residents voted to incorporate in 2006;
 *                             the city became official in 2007.
 *   "82% growth 2000-2020"  → VERIFIED. The only stat that held up.
 *
 * Note QuickFacts and data.census.gov both return 403 to automated requests, so
 * these came from the raw files on www2.census.gov — which is the stronger
 * source anyway, since QuickFacts is just a rendering of them.
 *
 * RULE: do not add a number here without a primary source URL and the exact
 * figure that source publishes. If a claim needs a comparison year, confirm that
 * year has data before writing the comparison.
 */

export type Stat = {
  readonly id: string
  /** The headline figure, pre-formatted. */
  readonly figure: string
  readonly caption: string
  /** Attribution shown on the page. Must name the actual source, not a guess. */
  readonly source: string
  /**
   * Where the attribution links to. Must be a page a NON-TECHNICAL VISITOR can
   * actually use — not a pipe-delimited data file. Every URL here was checked
   * for a 200 on 2026-08-04.
   *
   * Deliberately NOT linked: census.gov/quickfacts, which would be the obvious
   * choice but returns 403 to anything that is not an interactive browser
   * session. It may well work when a person clicks it; we could not confirm
   * that, so we do not ship it. A source link that 403s is worse than no link —
   * it makes a true claim look fabricated.
   */
  readonly sourceUrl: string
}

/** Underlying verified values, so prose elsewhere can stay in lockstep. */
export const CENSUS = {
  population2000: 16_582,
  population2020: 30_104,
  /** Vintage 2025 estimate, July 1 2025. */
  populationLatest: 34_518,
  populationLatestAsOf: 'July 1, 2025',
  /** New housing units authorized, Census Building Permits Survey. */
  permits2024: 637,
  permits2012: 28,
} as const

/**
 * Human-readable landing pages for the two Census products behind these stats.
 * The exact primary files we parsed are recorded beside each stat, for our own
 * audit trail — but we link the browsable page, because the visitor clicking
 * "U.S. Census Bureau" wants a table, not a fixed-width text dump.
 */
const CENSUS_PROFILE =
  'https://data.census.gov/profile/Bella_Vista_city,_Arkansas?g=160XX00US0504840'
const CENSUS_BPS = 'https://www.census.gov/construction/bps/'

/** 16,582 → 34,518 is +108.2%. Stated as "more than doubled" to age gracefully. */
export const STATS: readonly Stat[] = [
  {
    id: 'population-growth',
    figure: 'More than double',
    caption: `Bella Vista's population since the 2000 census — from ${CENSUS.population2000.toLocaleString()} to ${CENSUS.populationLatest.toLocaleString()}`,
    source: 'U.S. Census Bureau',
    // 2000: CPH-2-5 Table 9. 2020: PL 94-171, GEOID 1600000US0504840, POP100.
    sourceUrl: CENSUS_PROFILE,
  },
  {
    id: 'population-now',
    figure: CENSUS.populationLatest.toLocaleString(),
    caption: `Estimated residents as of ${CENSUS.populationLatestAsOf}, up from ${CENSUS.population2020.toLocaleString()} counted in the 2020 census`,
    source: 'U.S. Census Bureau population estimates',
    // Vintage 2025 subcounty population estimates.
    sourceUrl: CENSUS_PROFILE,
  },
  {
    id: 'permits',
    figure: CENSUS.permits2024.toLocaleString(),
    // Comparison uses 2012, which HAS data. The artifact compared to 2013,
    // which does not exist in the survey — Bella Vista reported zero months.
    caption: `New housing units authorized in 2024, up from ${CENSUS.permits2012} in 2012`,
    source: 'U.S. Census Bureau, Building Permits Survey',
    // Annual place files: www2.census.gov/econ/bps/Place/ (so2024a.txt, so2012a.txt).
    // 2024 Bella Vista row: 637 buildings / 637 units / $225,373,341, 12 months reported.
    sourceUrl: CENSUS_BPS,
  },
] as const

/**
 * Rendering contract for the stat attributions.
 *
 * Each `source` renders as a real anchor to its `sourceUrl`, opening in a new
 * tab with rel="noopener noreferrer". This is the difference between a claim
 * that says "Census" and a claim a skeptical neighbor can check in one click —
 * which, on a page whose whole argument is "you should be able to check my
 * reasoning," is the point.
 *
 * The link must be visibly a link. An underline that meets 3:1 against the
 * background, not color alone (WCAG 1.4.1). Note these sit on the gradient
 * band, so see BRAND.md before choosing the underline color.
 */
export const STAT_SOURCE_LINKS_REQUIRED = true

/**
 * Framing copy for the section. "Voted to incorporate in 2006 ... official in
 * 2007" matches the City of Bella Vista's own About page, which the artifact's
 * "became a city in 2006" contradicted.
 */
export const GROWTH_INTRO = {
  eyebrow: 'The situation',
  heading: 'Bella Vista is not the town it was ten years ago.',
  lede:
    'Residents only voted to incorporate in 2006, and Bella Vista only became a ' +
    'city in 2007. We have been catching up ever since. These are the numbers the ' +
    'next council has to plan around.',
  note:
    'Growth is not the problem. Unplanned growth is. Every new rooftop adds demand ' +
    'on streets, drainage, police, fire, and EMS, while what funds the city has ' +
    'stayed narrow.',
} as const
