import { Fragment } from 'react'

/**
 * A page title whose clauses arrive one at a time, with one word set in the
 * campaign accent.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS IS A COMPONENT AND NOT FOUR COPIES
 * ─────────────────────────────────────────────────────────────────────────────
 * The home hero had this treatment alone until 2026-09-02, when the campaign
 * asked for it on every page title. Four hand-rolled copies of a split, an
 * accent match and a stagger is four places for them to drift apart — and the
 * hero's version already carried two bugs' worth of hard-won detail (see the
 * whitespace note below, and the direct-child selector in sections.css).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SEGMENTS ARE DATA, NOT MARKUP
 * ─────────────────────────────────────────────────────────────────────────────
 * Each clause animates on its own beat, so the split has to be a list the
 * content module owns rather than spans typed into JSX. Rewording a title is
 * then an edit to one array, and no component has to be opened to do it.
 */

/**
 * Sets `accent` apart wherever it appears in the clause.
 *
 * ⚠ This searches the WHOLE clause rather than only its end, and that is
 * load-bearing rather than generous. The hero's original version tested
 * `segment.endsWith(accent)`, which is true of "Prosper." and "Neighbor." and
 * false of "matters" in "It matters more than you think." — the Get involved
 * title accents a word in the middle of its clause, and an ends-with test would
 * have silently rendered it unaccented.
 *
 * Returns the clause untouched when the accent is not in it, which is what makes
 * the accent safe to store as its own field: reword a clause past its accent and
 * the title loses a colour, never a word.
 */
function accentuate(segment: string, accent: string) {
  const at = segment.indexOf(accent)
  if (at < 0) return segment
  return (
    <>
      {segment.slice(0, at)}
      <span className="title-accent">{accent}</span>
      {segment.slice(at + accent.length)}
    </>
  )
}

export function StaggerTitle({
  segments,
  accent,
  className,
  level = 'h1',
  style,
}: {
  /** The title, split at the boundaries it should animate on. */
  readonly segments: readonly string[]
  /** The one word or phrase set in the accent colour. */
  readonly accent: string
  readonly className?: string
  /** h1 for a page's own title, h2 for a section inside one. */
  readonly level?: 'h1' | 'h2'
  readonly style?: React.CSSProperties
}) {
  const Tag = level
  const clauses = segments.map((segment, index) => (
    <Fragment key={segment}>
      {/*
        The space belongs BETWEEN the spans, not inside them. Each clause is an
        inline-block so it can be transformed, and trailing whitespace inside an
        inline-block is trimmed — which once ran the home hero's first two
        clauses together as "Listening.Serving."
      */}
      {index > 0 ? ' ' : null}
      <span>{accentuate(segment, accent)}</span>
    </Fragment>
  ))
  return (
    <Tag className={className ? `${className} stagger` : 'stagger'} style={style}>
      {clauses}
    </Tag>
  )
}
