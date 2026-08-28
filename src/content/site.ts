/**
 * Site-level identity, metadata, and the page list.
 *
 * VOICE DECISION (2026-08-04): Nancy's own words lead. Where her bio and the
 * original artifact draft disagreed, hers wins.
 *
 * The artifact opened with "Transparent leadership. Responsible growth." — a
 * line produced by a drafting tool. Nancy opens AND closes her bio with
 * "Listening. Serving. Building Bella Vista Together." A line a candidate
 * repeats unprompted is the line she actually believes. That one leads.
 *
 * CORRECTION (2026-08-09): the campaign's design project supersedes two values
 * below. Both changes come from the campaign's own file, not from a drafting
 * tool, so they are adopted rather than argued with:
 *
 *   heroLede    was the artifact's "Bella Vista is growing fast…" paragraph.
 *               The design sets a short line instead. Kept.
 *   kicker      "Transparent leadership. Responsible growth." no longer appears
 *               anywhere in the design. It survives here, unused, because
 *               deleting a line the campaign may still want costs nothing to
 *               keep and cannot be recovered from a repository with no history.
 *
 * CORRECTION (2026-08-27): heroLede changes again, and this time it is Nancy's
 * own doing. Her email that day sent a full growth statement and said it goes
 * "in place of the 'I listen' text". The statement runs about four hundred
 * words; this slot is one line under the H1, above three buttons, over a
 * photograph. The literal instruction is not physically possible, so the
 * statement went to `statement.ts` and renders in the section directly below the
 * hero, and this slot took the one sentence of hers that fits it.
 *
 *   heroLede    was "I listen. I connect. I solve problems." — the design
 *               project's skills triad. Now the second half of her own closing
 *               line, which the statement below repeats in full, so it reads as
 *               a refrain rather than a repetition. Her words beat the design's,
 *               per the voice decision at the top of this file.
 *
 * Two lines of hers were considered and rejected for this slot. "Protect. Plan.
 * Prosper." is a three-beat, full-stopped refrain, and it would sit immediately
 * under `tagline`, which is also a three-beat, full-stopped refrain animated in
 * one clause at a time — two of those stacked compete instead of reinforcing, so
 * it stays at the foot of the statement card where it has the room to land. And
 * "I believe Bella Vista can move forward…" is the sentence the same email
 * assigns to the statement's own standfirst, which renders directly below this
 * one; the identical sentence twice in one scroll is the sharpest duplication
 * this change could have introduced.
 *
 *   ⚠ CONFIRM she meant this line and not the whole statement. See the
 *     "still to confirm" list at the top of statement.ts.
 */

import { BIO_SIGNOFF } from './bio'

export const SITE = {
  candidate: 'Nancy Orum',
  /** Her signature line — hero headline and the site's primary tagline. */
  tagline: BIO_SIGNOFF.refrain,
  /**
   * The same line, split at its three sentence boundaries. The hero animates
   * each clause in on its own beat, so the split has to be data rather than
   * three hardcoded spans in JSX (§2.4). Revising the tagline changes it here.
   */
  taglineSegments: ['Listening.', 'Serving.', 'Building Bella Vista Together.'],
  /**
   * The one word of the refrain set in the campaign green instead of white.
   *
   * Stored as the word rather than as an index or a fourth segment, and matched
   * against the end of whichever clause contains it, so `taglineSegments` above
   * stays the only place the headline's wording lives. Rewriting a clause can
   * therefore never leave this pointing at a word that is no longer in it — the
   * colour just stops applying, which is a far cheaper failure than a headline
   * assembled out of two lists that disagree.
   */
  taglineAccent: 'Together.',
  /** Retained but unrendered — see the correction note above. */
  kicker: 'Transparent leadership. Responsible growth.',
  /** Hers, from the 2026-08-27 statement. See the correction note above. */
  heroLede: 'I want us to become an even better Bella Vista.',
  heroEyebrow: 'Ward 2 · Position 2',
  office: 'Bella Vista City Council',
  seat: 'Ward 2, Position 2',
  city: 'Bella Vista',
  state: 'Arkansas',
} as const

/**
 * `<title>` and meta description.
 *
 * Kept under ~60 and ~155 characters respectively so neither is truncated in
 * search results. The description leads with her tagline, then states the race,
 * then — deliberately — the at-large fact, because "every Bella Vista voter"
 * is the single most useful thing a stranger can learn from a search snippet.
 */
export const SEO = {
  title: 'Nancy Orum for Bella Vista City Council, Ward 2',
  description:
    'Listening. Serving. Building Bella Vista Together. Nancy Orum is running for ' +
    'Bella Vista City Council, Ward 2, Position 2 — and every Bella Vista voter ' +
    'votes in this race. General election November 3, 2026.',
  /** Absolute URL, set once the domain is purchased. Required for OG tags. */
  canonicalOrigin: null as string | null,
} as const

/**
 * Site navigation. Each entry is a real page with its own URL, title, and
 * description — not an anchor into one long document, and not a tab switched by
 * client state. The design mockup is a single file with a `tab` in component
 * state; that cannot be linked to, shared, bookmarked, or crawled, so it
 * becomes four prerendered documents here.
 *
 * `path` is relative to the site root and always ends in a slash (except home),
 * so links work identically whether the site is served from the root — which is
 * what the Cloudflare Worker does today, with `SITE_BASE` left at `/` — or from
 * a `/<repo>/` style prefix if it is ever moved somewhere that needs one.
 *
 * Adding a page means adding an entry here and a case in entry-server.tsx.
 * That is the whole cost — no router, no route config, no prerender list to
 * keep in sync.
 */
export type NavPage = {
  readonly id: string
  readonly path: string
  readonly label: string
  readonly title: string
  readonly description: string
  /** Whether the header and footer link to it. */
  readonly inNav: boolean
  /** Emits `<meta name="robots" content="noindex">`. */
  readonly noindex?: boolean
}

export const PAGES_NAV: readonly NavPage[] = [
  {
    id: 'home',
    path: '',
    label: 'Home',
    title: 'Nancy Orum for Bella Vista City Council, Ward 2',
    description:
      'Listening. Serving. Building Bella Vista Together. Nancy Orum is running for ' +
      'Bella Vista City Council, Ward 2, Position 2 — and every Bella Vista voter ' +
      'votes in this race. General election November 3, 2026.',
    inNav: true,
  },
  {
    id: 'nancy',
    path: 'nancy/',
    label: 'About Nancy',
    title: 'Meet Nancy Orum — Bella Vista City Council, Ward 2',
    description:
      'Nancy Orum in her own words: 22 years teaching, a family rooted in Northwest ' +
      'Arkansas, and why she is running for Bella Vista City Council.',
    inNav: true,
  },
  {
    id: 'platform',
    path: 'platform/',
    label: 'Platform',
    title: 'Six commitments — Nancy Orum for Bella Vista City Council',
    description:
      'Listen first, plan for thoughtful growth, protect our character, build ' +
      'partnerships, focus on practical solutions, and lead with care and respect.',
    inNav: true,
  },
  {
    id: 'involved',
    path: 'involved/',
    label: 'Get involved',
    title: 'Get involved — Nancy Orum for Bella Vista City Council',
    description:
      'Put up a yard sign, knock doors, or host a meet and greet. Every Bella Vista ' +
      'voter votes in this race.',
    inNav: true,
  },
  {
    /**
     * The mockup's donate dialog, as a page. Linked from the Donate buttons
     * while DONATE_URL is null; unlinked the moment it is set.
     */
    id: 'donate',
    path: 'donate/',
    label: 'Donate',
    title: 'Donate — Nancy Orum for Bella Vista City Council',
    description: 'Online donations are not open yet. Here is how else to help.',
    inNav: false,
  },
  {
    /**
     * Where Web3Forms sends people after a successful submission. Not in the
     * navigation, but a real document — the mockup showed this as an in-place
     * component state, which a native form POST cannot reproduce.
     */
    id: 'thanks',
    path: 'thanks/',
    label: 'Thank you',
    title: 'Thank you — Nancy Orum for Bella Vista City Council',
    description: 'Your message reached the campaign. Thank you, neighbor.',
    inNav: false,
    /** Only meaningful as a destination, never as a search result. */
    noindex: true,
  },
] as const

export const NAV_PAGES: readonly NavPage[] = PAGES_NAV.filter((p) => p.inNav)

/** Prefix a site-relative path with the deploy base. */
export function href(base: string, path: string): string {
  return `${base}${path}`
}
