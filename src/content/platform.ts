/**
 * The six commitments.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PROVENANCE — read this before editing a word of it
 * ─────────────────────────────────────────────────────────────────────────────
 * This text comes from the campaign's own design project (claude.ai/design
 * 49f5002f, "Nancy Orum Campaign Site", 2026-08-09), not from a drafting tool.
 * That is what separates it from `priorities.ts`, whose three planks came out
 * of the original artifact and are still unapproved and unrendered.
 *
 * Two further things support treating this as hers. It is written in the voice
 * of `bio.ts` — the teacher-then-Realtor frame, the connector language, the
 * insistence on listening — and it makes no specific policy promise of the kind
 * priorities.ts warns about. "Listen first. Ask questions. Communicate clearly"
 * is a commitment about conduct. "New development pays its own way" is a
 * position with organised opposition. She can be held to both, but only one of
 * them can be adopted on her behalf.
 *
 * The approval flag below is the same mechanism priorities.ts uses. It is true
 * because the copy is the campaign's; flip it to false if that ever stops being
 * the case, and the build will stop.
 */

import { IMAGES, type Img } from './images'

export const PLATFORM_APPROVED_BY_CANDIDATE = true

export type Commitment = {
  readonly id: string
  /** Two digits, as the mockup sets them: "Commitment 01". */
  readonly num: string
  /** Full heading, used on the platform page. */
  readonly title: string
  /** Shortened for the index pills, where the row must not wrap. */
  readonly pill: string
  /** Shortened for the home-page card grid. */
  readonly cardTitle: string
  /** The one-line claim. Doubles as the home card's body. */
  readonly lede: string
  readonly paragraphs: readonly string[]
  /** The line set apart in tinted type at the foot of each card. */
  readonly pull: string
  /** Photograph, or the logo lockup on the brand gradient for the last one. */
  readonly image: Img | null
}

export const PLATFORM_INTRO = {
  eyebrow: 'My platform',
  headingLead: 'Six commitments, one goal:',
  headingEmphasis: 'grow well.',
  lede:
    'We need leaders who will listen before making decisions, ask thoughtful ' +
    'questions, communicate openly, build partnerships, and work toward solutions ' +
    'that serve our entire community.',
} as const

export const PLATFORM_PREVIEW = {
  eyebrow: 'The platform',
  heading: 'Six commitments to Bella Vista',
  cta: 'Read the full platform',
} as const

export const COMMITMENTS: readonly Commitment[] = [
  {
    id: 'listen-first',
    num: '01',
    title: 'Listen first',
    pill: 'Listen first',
    cardTitle: 'Listen first',
    lede: 'Good leadership begins with listening.',
    paragraphs: [
      'As a teacher, I learned that people thrive when they feel heard, respected, and valued. As a Realtor, I use those same skills every day to understand people’s priorities and help them navigate important decisions. I will bring that approach to City Council.',
      'I believe residents deserve accessible leadership, clear communication, and meaningful opportunities to participate in conversations about Bella Vista’s future.',
    ],
    pull: 'My commitment: Listen first. Ask questions. Communicate clearly. Represent residents with respect.',
    image: { ...IMAGES.communityEvent, alt: 'Nancy Orum listening to a neighbour at a community booth' },
  },
  {
    id: 'thoughtful-growth',
    num: '02',
    title: 'Plan for thoughtful growth',
    pill: 'Thoughtful growth',
    cardTitle: 'Plan for thoughtful growth',
    lede: 'Growth should strengthen Bella Vista — not diminish what makes it special.',
    paragraphs: [
      'Northwest Arkansas continues to grow, and Bella Vista will continue to experience the opportunities and challenges that come with that growth. My years with the Bentonville School District allowed me to witness tremendous growth firsthand — anticipating future needs, planning ahead, adapting when circumstances changed, and bringing people together around shared goals.',
      'We should ask: What has worked elsewhere? What can we learn from it? And how can we make it work for Bella Vista?',
    ],
    pull: 'Thoughtful growth means balancing progress with preservation — deciding with both today’s residents and future generations in mind.',
    image: IMAGES.familySquare,
  },
  {
    id: 'protect-character',
    num: '03',
    title: 'Protect the character of Bella Vista',
    pill: 'Protect our character',
    cardTitle: 'Protect our character',
    lede: 'Progress and preservation can work together.',
    paragraphs: [
      'Our lakes, trails, trees, natural beauty, neighborhoods, and quality of life are among the reasons people choose Bella Vista. Growth should never mean forgetting who we are.',
      'As we make decisions about Bella Vista’s future, I will support thoughtful planning that considers infrastructure, public safety, neighborhoods, responsible development, our natural environment, and the character of our community.',
    ],
    pull: 'The goal isn’t simply to grow. The goal is to grow well.',
    image: IMAGES.tanyardCreek,
  },
  {
    id: 'partnerships',
    num: '04',
    title: 'Build stronger partnerships',
    pill: 'Stronger partnerships',
    cardTitle: 'Build stronger partnerships',
    lede: 'We don’t have to solve every challenge alone.',
    paragraphs: [
      'Bella Vista is surrounded by successful cities, schools, businesses, nonprofits, community organizations, and regional partners. One of my greatest strengths is being a connector and facilitator — bringing people to the table, identifying common goals, and finding ways for people and organizations to work together.',
      'City Council should actively look for opportunities to collaborate, share knowledge, learn from successful models, and build partnerships that benefit Bella Vista residents.',
    ],
    pull: 'Strong communities aren’t built in silos. They’re built through relationships.',
    image: { ...IMAGES.heroArmsCrossed, focus: '30% 30%' },
  },
  {
    id: 'practical-solutions',
    num: '05',
    title: 'Focus on practical solutions',
    pill: 'Practical solutions',
    cardTitle: 'Focus on practical solutions',
    lede: 'City government should work for the people it serves.',
    paragraphs: [
      'Complex problems rarely have simple answers. They require research, thoughtful questions, different perspectives, collaboration, and a willingness to find common ground.',
      'Teaching taught me to solve problems creatively. Real estate taught me to navigate complicated situations while keeping people and their goals at the center of the process. I will bring that same practical, solutions-oriented approach to City Council.',
    ],
    pull: 'I am less interested in who gets credit for an idea than whether it works for Bella Vista.',
    image: IMAGES.headshot,
  },
  {
    id: 'care-and-respect',
    num: '06',
    title: 'Lead with care and respect',
    pill: 'Care and respect',
    cardTitle: 'Lead with care and respect',
    lede: 'How we lead matters just as much as what we accomplish.',
    paragraphs: [
      'I believe people can disagree and still respect one another. We can have difficult conversations without becoming divided. We can listen to different perspectives without losing sight of our shared love for Bella Vista.',
      'Leadership should be grounded in compassion, integrity, transparency, and respect.',
    ],
    pull: 'Whether we agree on every issue or not, your voice matters to me — and you deserve to be heard.',
    /** No photograph in the mockup; the logo sits on the brand gradient. */
    image: null,
  },
] as const
