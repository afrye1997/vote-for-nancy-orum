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
 * "I believe Bella Vista can move forward…" was considered for this slot and
 * rejected: the same email assigns that sentence to the statement's standfirst,
 * which renders directly below this one, and the identical sentence twice in one
 * scroll is the sharpest duplication this change could have introduced.
 *
 *   ⚠ CONFIRM she meant this line and not the whole statement. See the
 *     "still to confirm" list at the top of statement.ts.
 *
 * CORRECTION (2026-08-28): the tagline follows the artwork, and this supersedes
 * the 2026-08-04 voice decision above on one point only.
 *
 *   tagline     was `BIO_SIGNOFF.refrain`, "Listening. Serving. Building Bella
 *   segments    Vista Together." Now "Protect. Plan. Prosper.", the line on the
 *   accent      red banner of her walk card and, in its longer form, the yellow
 *               banner on the front of it and the foot of her statement.
 *
 * The 2026-08-04 reasoning still holds for what it decided — her line beat the
 * drafting tool's, and it should have. What it could not know is that she would
 * later print a different line on every sign, card and banner she ordered. The
 * site was showing a slogan that appears on none of her campaign material, which
 * is a worse outcome than either line on its own.
 *
 * Note this DOES place the refrain immediately above the hero lede, which an
 * earlier draft of the note above argued against. The objection was to stacking
 * two competing three-beat refrains. There is only one now: the H1 is the
 * refrain, and the lede under it is a sentence. The clash the objection guarded
 * against cannot occur.
 *
 * `bio.ts` is untouched. "Listening. Serving. Building Bella Vista Together." is
 * still how she closes her own bio, and her bio is not on the site: nothing
 * imports `Biography.tsx`, so the line reaches no page and is not even in the
 * JS bundle. (An earlier version of this note said that component "still renders
 * it there." It does not, and correcting that is the whole of what 2026-09-01
 * changed here.)
 *
 * CONFIRMED (2026-09-01): the candidate chose PPP over the old refrain in her
 * own words — "I think I like the new plan, protect, and prosper over the
 * original jargon. My walk card matches the PPP too. So I think remove the
 * other unless there's a place you think it needs to go."
 *
 * There was no place it needed to go, and nothing to remove from any page,
 * because it had already reached zero. The only candidate slot was the foot of
 * her full biography, which is not published — and even there it would have sat
 * one screen above the CTA band's "Let's build them together.", which is the
 * duplication the note above exists to prevent. Her bio keeps her sentence; the
 * site carries her slogan.
 */

import { DONATE_URL } from './election'
import { PLATFORM_META_DESCRIPTION } from './platform'

export const SITE = {
  candidate: 'Nancy Orum',
  /**
   * The campaign slogan, and the hero headline.
   *
   * ⚠ NO LONGER `BIO_SIGNOFF.refrain`, and the decoupling is the point.
   *
   * Until 2026-08-27 this read through to bio.ts, because "Listening. Serving.
   * Building Bella Vista Together." is how Nancy opens and closes her own bio
   * and a line a candidate repeats unprompted is the line she believes. That
   * reasoning has not changed and neither has bio.ts — her signoff is still her
   * signoff, sitting in her bio, which no page renders.
   *
   * What changed is that she now has a printed campaign slogan, and it is a
   * different line. "Protect. Plan. Prosper." is on the red banner of her walk
   * card, and "Protect what we love / Plan for what's next / Prosper together"
   * is the yellow banner on its front. The site was showing a slogan that
   * appears on none of her printed material.
   *
   * So the two are separate fields now rather than one field doing both jobs:
   * the bio keeps the sentence she wrote about herself, and the hero carries the
   * sentence her signs carry. Do not re-point this at bio.ts to save a string.
   */
  tagline: 'Protect. Plan. Prosper.',
  /**
   * The same line, split at its three sentence boundaries. The hero animates
   * each clause in on its own beat, so the split has to be data rather than
   * three hardcoded spans in JSX (§2.4). Revising the tagline changes it here.
   */
  taglineSegments: ['Protect.', 'Plan.', 'Prosper.'],
  /**
   * The one word of the refrain set in the campaign green instead of white.
   *
   * Stored as the word rather than as an index or a fourth segment, and matched
   * against the end of whichever clause contains it, so `taglineSegments` above
   * stays the only place the headline's wording lives. Rewriting a clause can
   * therefore never leave this pointing at a word that is no longer in it — the
   * colour just stops applying, which is a far cheaper failure than a headline
   * assembled out of two lists that disagree.
   *
   * "Prosper." rather than the old "Together.": it is the clause the other two
   * build to, and it is the last one to animate in.
   */
  taglineAccent: 'Prosper.',
  /*
   * `kicker` was here: "Transparent leadership. Responsible growth."
   *
   * Deleted 2026-09-01, on the candidate's instruction to retire the old
   * framing. It was a drafting tool's line, never hers, and no component had
   * read it since 2026-08-09 — but it was NOT tree-shaken, because it rode
   * inside this object, so every visitor was still downloading it.
   *
   * It was kept in 2026-08-09 for one stated reason: that a line the campaign
   * might still want "cannot be recovered from a repository with no history."
   * The repository has history now, and this comment is the pointer to it.
   */
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
    'Protect. Plan. Prosper. Nancy Orum is running for Bella Vista City Council, ' +
    'Ward 2, Position 2 — and every Bella Vista voter votes in this race. ' +
    'General election November 3, 2026.',
  /** Absolute URL, set once the domain is purchased. Required for OG tags. */
  canonicalOrigin: null as string | null,
  /**
   * Google Search Console ownership token — the `content` of the
   * `<meta name="google-site-verification">` tag Search Console shows under
   * "HTML tag". Public by design; it proves nothing except that whoever can
   * edit this site's head also holds the Search Console account. Null emits
   * no tag.
   *
   * The HTML-file method cannot work on this host: the Worker redirects every
   * `.html` URL to its extensionless path, and Search Console does not follow
   * redirects for the verification file. The tag goes in the head instead.
   */
  googleSiteVerification: '3UWATDwF8HnJlMwiRTKXaPRygT3mr__fkIoNShdFWdM' as string | null,
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
    /** Leads with the slogan, which changed with the artwork on 2026-08-27. */
    description:
      'Protect. Plan. Prosper. Nancy Orum is running for Bella Vista City Council, ' +
      'Ward 2, Position 2 — and every Bella Vista voter votes in this race. ' +
      'General election November 3, 2026.',
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
    /**
     * Derived, not written. This was a hand-copy of the old six, and nothing in
     * the build compares a description against the page it describes — so when
     * the commitments changed on 2026-09-02 this string would have gone on
     * serving the retired platform to search results and every shared link,
     * silently and indefinitely. Deriving removes the failure mode.
     */
    description: PLATFORM_META_DESCRIPTION,
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
    /**
     * Noindex the moment the processor is live. With DONATE_URL set, nothing
     * links here and every Donate button takes money — so a search result for
     * "nancy orum donate" landing on "Coming soon" would contradict the site.
     * Noindex also keeps it out of the sitemap and the structured data, which
     * both key off this flag. The page itself still builds, so a null
     * DONATE_URL brings it back with no other change.
     */
    noindex: DONATE_URL !== null,
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
