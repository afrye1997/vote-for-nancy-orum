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

/**
 * The band that closes every page.
 *
 * "are still ahead of us", restored 2026-09-02 at her request. The design
 * project had softened her own sentence — bio.ts has "I am running for City
 * Council because I believe Bella Vista's best days ARE still ahead of us" — into
 * "can still be", which turns an assertion into a possibility. She was asked and
 * wanted the stronger version back, so this is her line again.
 *
 * She was asked about the second line in the same breath, since it leans on
 * "together", the word the headline retired in favour of "Prosper." She chose to
 * keep it. It stays.
 */
export const CTA_BAND = {
  title: 'Bella Vista’s best days are still ahead of us.',
  sub: 'Let’s build them together.',
} as const

export const HERO_ACTIONS = {
  join: 'Join the campaign',
  about: 'Meet Nancy',
} as const
