/**
 * The platform page's furniture. THE COMMITMENTS THEMSELVES ARE NOT HERE.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THIS FILE OWNS NUMBERING AND NAV LABELS. STATEMENT.TS OWNS THE WORDS.
 * ─────────────────────────────────────────────────────────────────────────────
 * On 2026-09-02 the campaign replaced the six commitments with the six things
 * Nancy says she would advocate for: "those are the new commitments so go ahead
 * and update it all."
 *
 * So `COMMITMENTS` is DERIVED from `approvedStatement().advocacy` rather than
 * being a second copy of it. That is not tidiness. `statement.ts` says in as many
 * words that her strings must not be copied into a plain exported constant,
 * because the gate is the whole point — and `COMMITMENTS` is exactly such a
 * constant. Deriving satisfies that rule; pasting would have broken it while
 * looking identical in the rendered page.
 *
 * It also means the home page and the platform page cannot drift. There is one
 * list of her six on this site and both pages read it.
 *
 * ⚠ DO NOT EDIT HER WORDS HERE. There is nothing here to edit — `title`, `lede`
 * and `pull` are her `label`, `body` and `aside`, passed through untouched. Any
 * change to what she says is a change to statement.ts, and hers to make.
 *
 * ⚠ THE ORDER OF HER LIST SETS THE ANCHOR IDS. `#commitment-01` is whichever
 * item is first in `STATEMENT.advocacy`. Reordering that array silently
 * repoints every deep link into this page, including the ones the rail's own
 * index emits.
 *
 * `PLATFORM_APPROVED_BY_CANDIDATE` was deleted with the old copy. Two approval
 * flags governing one body of text is a trap — flip one and the other page keeps
 * publishing. `STATEMENT_APPROVED_BY_CANDIDATE` is now the only gate, and it
 * still fails the build here: `COMMITMENTS` calls `approvedStatement()` at module
 * scope, so importing this file at all runs the check.
 */

import { IMAGES, type Img } from './images'
import { approvedStatement } from './statement'

export type Commitment = {
  readonly id: string
  /** Two digits, as the mockup sets them: "Commitment 01". Derived from order. */
  readonly num: string
  /** Her label, verbatim. */
  readonly title: string
  /** Her body, verbatim. The one-line claim. */
  readonly lede: string
  /**
   * Her aside, verbatim, set apart in tinted type at the foot of the card.
   *
   * Optional because only three of her six have one, and a card with an empty
   * pull renders an empty tinted bar — the rail guards on this.
   */
  readonly pull?: string
  /** Nav label for the index row. OURS, not hers — see PILLS. */
  readonly pill: string
  /**
   * A photograph, where one can honestly illustrate the point. Optional, and
   * most of them do not have one — see ART.
   */
  readonly image?: Img
}

/**
 * The chip labels on the rail's index row.
 *
 * These are the only new words in this file, and they are navigation rather than
 * copy: `.rail-index__link` is `white-space: nowrap`, so a 34-character label
 * like "Make tourism work for residents" would push that row past the viewport.
 * They shorten her labels; they never rephrase her position.
 *
 * Typographic apostrophes here because these are the site's words. Hers stay
 * straight — see the punctuation note in statement.ts.
 */
const PILLS: Record<string, string> = {
  'natural-areas': 'Natural areas',
  neighborhoods: 'Neighborhoods',
  'traffic-first': 'Traffic first',
  infrastructure: 'Infrastructure',
  'residents-voice': 'Residents\u2019 voice',
  tourism: 'Tourism',
}

/**
 * Photographs, by advocacy id. Absent is the normal case.
 *
 * ⚠ ADD ONE ONLY IF IT IS HONESTLY A PICTURE OF THE POINT. A photograph sitting
 * over a policy position is read as evidence for it, and the library here has
 * nothing of a road, an intersection, a residential street, a utility, a
 * storefront, or a Police, Fire or EMS crew. Five of her six therefore have no
 * image and render without a media band, which is the honest outcome rather than
 * a gap waiting to be filled with something approximate.
 *
 * `natural-areas` was added on 2026-09-02 at the campaign's request, having been
 * declined once on this reasoning: her aside on that card names Little Sugar
 * Creek, and the photograph is Tanyard Creek — a different watercourse. The
 * campaign knows the ward and made the call, and the risk is contained by the
 * alt text, which describes the picture ("Waterfall on a wooded Bella Vista
 * creek") without naming a creek or claiming to show her project. Do not
 * "improve" that alt text into naming one.
 */
const ART: Record<string, Img> = {
  'natural-areas': IMAGES.tanyardCreek,
}

export const COMMITMENTS: readonly Commitment[] = approvedStatement().advocacy.map(
  (item, index) => {
    const pill = PILLS[item.id]
    /*
     * A throw, not a fallback to her label. If she adds a seventh point or an id
     * changes, this stops the build rather than shipping a nav row with a chip
     * missing or one long enough to break the row.
     */
    if (pill === undefined) {
      throw new Error(
        `platform.ts: no index label for advocacy item "${item.id}". Add one to PILLS.`,
      )
    }
    return {
      id: item.id,
      num: String(index + 1).padStart(2, '0'),
      title: item.label,
      lede: item.body,
      ...(item.aside === undefined ? {} : { pull: item.aside }),
      ...(ART[item.id] === undefined ? {} : { image: ART[item.id] }),
      pill,
    }
  },
)

/**
 * The platform page's meta description, derived rather than written.
 *
 * This is the highest-consequence silent break in the whole change: nothing in
 * the build compares a hand-written description against the page it describes,
 * so a copied one would have gone on serving the retired six to search results
 * and every shared link. Deriving removes the failure mode instead of fixing it
 * once. Her labels, her capitalisation, no connective invented.
 */
export const PLATFORM_META_DESCRIPTION = `${COMMITMENTS.map((c) => c.title).join('. ')}.`

/**
 * The home statement's button through to this page.
 *
 * Lives here rather than in home.ts because it names this page, and it is what
 * survives of `PLATFORM_PREVIEW` — the six flip cards it belonged to were
 * deleted on 2026-09-02 for restating her sentences verbatim one section below
 * the statement card.
 */
export const PLATFORM_PREVIEW_CTA = 'Read the full platform'

export const PLATFORM_INTRO = {
  eyebrow: 'My platform',
  /**
   * "one Bella Vista" replaced "grow well." on 2026-09-02, because "grow well"
   * was the pull quote of a commitment that no longer exists — it belonged to
   * "Protect the character of Bella Vista" and pointed at copy the page had
   * stopped carrying.
   *
   * ⚠ This clause is the only sentence on the platform page nobody has approved.
   * It makes no policy claim and it is furniture of the same class as the line it
   * replaced, but it is not hers. Swap it for anything she prefers.
   */
  headingSegments: ['Six commitments,', 'one Bella Vista.'],
  headingAccent: 'one Bella Vista.',
  /**
   * Hers, lifted from the statement's own opening rather than written. The old
   * lede — "We need leaders who will listen before making decisions…" — was the
   * design project's and was byte-identical to a sentence that used to sit on the
   * home page, so it went with the copy it introduced.
   */
  lede: approvedStatement().emphasis,
} as const

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SUPERSEDED 2026-09-02 — the design project's six commitments
 * ─────────────────────────────────────────────────────────────────────────────
 * Kept in full, for the reason site.ts and statement.ts keep theirs: the next
 * reader should be able to see what changed without knowing to go looking. This
 * is a comment, so it costs bytes in the source and nothing in dist/.
 *
 * They came from the campaign's design project on 2026-08-09 and were approved.
 * They are also a different KIND of thing from what replaced them — these are
 * commitments about CONDUCT ("Listen first", "Lead with care and respect"),
 * where hers are positions on POLICY. Nothing in her six covers how she would
 * behave in the room, which is what these were for.
 *
 * That is an argument for finding them a home rather than for putting them back
 * here — they would sit naturally on /nancy/ beside `Strengths`. Nobody has
 * asked for that, so it is an offer, not a plan.
 *
 *   listen-first
 *     title  Listen first
 *     lede   Good leadership begins with listening.
 *     para   As a teacher, I learned that people thrive when they feel heard, respected, and valued. As a Realtor, I use those same skills every day to understand …
 *     para   I believe residents deserve accessible leadership, clear communication, and meaningful opportunities to participate in conversations about Bella Vista…
 *     pull   My commitment: Listen first. Ask questions. Communicate clearly. Represent residents with respect.
 *
 *   thoughtful-growth
 *     title  Plan for thoughtful growth
 *     lede   Growth should strengthen Bella Vista — not diminish what makes it special.
 *     para   Northwest Arkansas continues to grow, and Bella Vista will continue to experience the opportunities and challenges that come with that growth. My year…
 *     para   We should ask: What has worked elsewhere? What can we learn from it? And how can we make it work for Bella Vista?
 *     pull   Thoughtful growth means balancing progress with preservation — deciding with both today’s residents and future generations in mind.
 *
 *   protect-character
 *     title  Protect the character of Bella Vista
 *     lede   Progress and preservation can work together.
 *     para   Our lakes, trails, trees, natural beauty, neighborhoods, and quality of life are among the reasons people choose Bella Vista. Growth should never mean…
 *     para   As we make decisions about Bella Vista’s future, I will support thoughtful planning that considers infrastructure, public safety, neighborhoods, respo…
 *     pull   The goal isn’t simply to grow. The goal is to grow well.
 *
 *   partnerships
 *     title  Build stronger partnerships
 *     lede   We don’t have to solve every challenge alone.
 *     para   Bella Vista is surrounded by successful cities, schools, businesses, nonprofits, community organizations, and regional partners. One of my greatest st…
 *     para   City Council should actively look for opportunities to collaborate, share knowledge, learn from successful models, and build partnerships that benefit…
 *     pull   Strong communities aren’t built in silos. They’re built through relationships.
 *
 *   practical-solutions
 *     title  Focus on practical solutions
 *     lede   City government should work for the people it serves.
 *     para   Complex problems rarely have simple answers. They require research, thoughtful questions, different perspectives, collaboration, and a willingness to …
 *     para   Teaching taught me to solve problems creatively. Real estate taught me to navigate complicated situations while keeping people and their goals at the …
 *     pull   I am less interested in who gets credit for an idea than whether it works for Bella Vista.
 *
 *   care-and-respect
 *     title  Lead with care and respect
 *     lede   How we lead matters just as much as what we accomplish.
 *     para   I believe people can disagree and still respect one another. We can have difficult conversations without becoming divided. We can listen to different …
 *     para   Leadership should be grounded in compassion, integrity, transparency, and respect.
 *     pull   Whether we agree on every issue or not, your voice matters to me — and you deserve to be heard.
 *
 */
