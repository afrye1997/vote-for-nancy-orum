/**
 * The three policy planks.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ⚠ NOT YET APPROVED BY THE CANDIDATE — see APPROVAL note below
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * NOTHING IMPORTS THIS FILE, AND THAT IS THE CURRENT STATE, NOT AN OVERSIGHT
 * ─────────────────────────────────────────────────────────────────────────────
 * The site ships the six commitments in `platform.ts` instead; these three
 * planks were the earlier framing and no page renders them. The file is kept
 * because the copy is still a live question for the campaign, not because it is
 * wired to anything.
 *
 * Which means the gate below was decorative for as long as it was a bare
 * boolean: a flag nobody reads cannot block a launch. `approvedPlanks()` is the
 * fix — the planks are reachable only through it, and it throws while the flag
 * is false. Prerendering runs the SSR bundle in Node, so the first page that
 * renders these fails the build rather than publishing them.
 *
 * Unlike `bio.ts`, this text did NOT come from Nancy. It came from the original
 * Claude artifact, i.e. a drafting tool. And unlike a tagline, these are
 * SPECIFIC POLICY COMMITMENTS written in the first person — "I will do X."
 *
 * "New development pays its own way for the infrastructure it requires" is a
 * real position with real opponents. Publishing it under her name binds her to
 * it at every doorstep and every forum for the rest of the campaign. She has to
 * actually hold these positions, in these words, before they go live.
 *
 * This is a different and larger problem than the tone mismatch. Tone can be
 * edited later. A policy commitment she never made cannot be un-said.
 *
 * Her bio DOES state a growth position in her own words, and it is compatible
 * with these planks but far less specific:
 *
 *   "Growth is a part of every thriving community, but thoughtful growth
 *    requires listening, planning, communication, and respect for the character
 *    that makes Bella Vista special."
 *
 * The gap between that and "new development pays its own way" is exactly the
 * gap she needs to close herself.
 */

export type Plank = {
  readonly id: string
  readonly label: string
  /** The problem, stated as a headline. */
  readonly heading: string
  /** Why it matters. */
  readonly body: string
  /** Concrete commitments. Each one is a promise she will be held to. */
  readonly commitments: readonly string[]
}

/**
 * APPROVAL GATE.
 *
 * Flip to true only after Nancy has read these planks word for word and
 * confirmed she holds these positions. Gate 3 blocks launch while this is false.
 * Do not flip it on anyone's behalf.
 */
export const PRIORITIES_APPROVED_BY_CANDIDATE = false

/** Framing for the section, verbatim from the artifact. */
export const PRIORITIES_INTRO = {
  eyebrow: 'Where I stand',
  // The artifact's heading for this section. It was briefly displaced by
  // "Transparent leadership. Responsible growth." — which is the artifact's
  // HERO line, not this one. Both are restored to their own places.
  heading: 'Three things, stated plainly.',
  lede:
    'Promises are easy. The reasoning behind them is what you should be able to ' +
    'check. So here is the problem, and here is what I will do.',
} as const

/**
 * The only way to reach the planks, and the whole of the gate.
 *
 * A component that wants to render them calls this. While the flag above is
 * false it throws, the prerender step fails, and nothing ships — which is what
 * "blocks launch" has to mean to be worth writing down.
 *
 * ⚠ Do not export `PLANKS` to route around this, and do not soften the throw
 * into a warning or an empty array. A silent empty section looks like a layout
 * bug and gets "fixed" by whoever meets it next; a failed build gets read.
 */
export function approvedPlanks(): readonly Plank[] {
  if (!PRIORITIES_APPROVED_BY_CANDIDATE) {
    throw new Error(
      'priorities.ts: these planks are specific policy commitments the candidate ' +
        'has not approved. Set PRIORITIES_APPROVED_BY_CANDIDATE only after she has ' +
        'read them word for word. See the note at the top of that file.',
    )
  }
  return PLANKS
}

const PLANKS: readonly Plank[] = [
  {
    id: 'transparency',
    label: 'Transparency',
    heading: 'You should not have to dig to find out how your money gets spent.',
    body: 'Most people cannot make a weekday council meeting. That should not be the price of knowing what the city decided and what it cost.',
    commitments: [
      'Agendas, budgets, and contracts posted before the vote, not after',
      'Plain language summaries of what each item does and what it costs',
      'Open office hours, with questions answered on the record',
    ],
  },
  {
    id: 'infrastructure',
    label: 'Roads and infrastructure',
    heading: 'Infrastructure is the first thing growth breaks.',
    // Was "a city of thirty-three thousand" — a year stale against the Vintage
    // 2025 estimate of 34,518. Phrased without a figure so it cannot go stale
    // again mid-campaign; the exact number lives once, in growth.ts.
    body: 'Our streets and drainage were laid out for a resort community, not a city more than twice that size. Every repair we put off costs more later, and residents still pay it.',
    commitments: [
      'Maintenance on a published schedule instead of a complaint-driven one',
      'New development pays its own way for the infrastructure it requires',
      'One annual report: what got fixed, what it cost, what is next',
    ],
  },
  {
    id: 'tax-base',
    label: 'The tax base',
    heading: 'A city funded almost entirely by rooftops has one lever left.',
    body: 'That lever is your tax bill. Homes use more in city services than they return in revenue. Widening what the city collects from is how we protect what homeowners pay.',
    commitments: [
      'Recruit the businesses residents already drive to Bentonville and Rogers for',
      'Grow sales tax revenue so property taxes carry less of the load',
      'Show the numbers on every incentive, in public, before the vote',
    ],
  },
] as const

/**
 * "Open office hours for Ward 2" in the artifact became "Open office hours"
 * here. Ward-scoped office hours are legitimate — she would represent Ward 2 —
 * but the phrasing sat inside a list of promises to voters, and every Bella
 * Vista voter votes in this race. See REACT_ENGINEER.md §2.6.
 */
