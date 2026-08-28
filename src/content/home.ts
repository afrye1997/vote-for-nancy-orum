/**
 * Home-page copy that is not already owned by another module.
 *
 * The growth statistics live in `growth.ts`, the commitment cards in
 * `platform.ts`, and — since 2026-08-27 — the candidate's growth statement in
 * `statement.ts`. The page composes all four. Nothing here restates a number.
 *
 * WHAT LEFT THIS FILE, 2026-08-27. `POWER_MESSAGE` and `VISION` used to hold the
 * home page's central message, sourced from the campaign's design project on
 * 2026-08-09. Nancy replaced that text with her own, and it moved to
 * `statement.ts` rather than being swapped in place: it now has a different
 * source, a different voice, and an approval gate this file has no business
 * carrying. The old strings are preserved in the SUPERSEDED block at the foot of
 * that file.
 *
 * What is left here is the design project's, and the header above is true of it.
 */

/** The band that closes every page. */
export const CTA_BAND = {
  title: 'Bella Vista’s best days can still be ahead of us.',
  sub: 'Let’s build them together.',
} as const

export const HERO_ACTIONS = {
  join: 'Join the campaign',
  about: 'Meet Nancy',
} as const
