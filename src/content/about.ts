/**
 * About-page copy.
 *
 * Source: the campaign's design project, 2026-08-09.
 *
 * This module holds the page's framing only. Nancy's biography itself is in
 * `bio.ts`, verbatim and untouchable.
 *
 * ⚠ CORRECTED 2026-09-01. This note used to say the About page "renders it in
 * full", and then argued at length for why it should. It does not, and by the
 * look of it never did: `Nancy.tsx` mounts AboutIntro, Strengths and RootedBand
 * and nothing else, `Biography.tsx` is imported by no page, and Vite tree-shakes
 * `bio.ts` out of the bundle entirely. `Nancy.tsx:12-17` is the accurate account
 * — the bio was added once and deliberately removed again, "because the design
 * does not have it and the design is the specification."
 *
 * The argument that was here is still worth having, and it is preserved in that
 * file rather than restated here. What could not stay is a comment that told
 * anyone reading it the opposite of what the code does — which is how a question
 * about where the candidate's retired refrain still appeared got answered wrong
 * three times before it was answered against the build.
 */

export const ABOUT_INTRO = {
  eyebrow: 'About Nancy',
  heading: 'Educator. Realtor. Neighbor.',
  /**
   * The same line, split at its three sentence boundaries so the title can
   * animate a clause at a time — see StaggerTitle. `heading` above is kept as
   * the single string because it reads better in a diff and in search, and
   * because two lists that disagree is exactly the failure the accent field
   * below is designed to avoid.
   */
  headingSegments: ['Educator.', 'Realtor.', 'Neighbor.'],
  /** The clause the other two build to, set in the campaign accent. */
  headingAccent: 'Neighbor.',
  paragraphs: [
    'I’m not running because I believe I have all the answers. I’m running because I know how to listen, learn, connect people, ask questions, and work toward solutions.',
    'I believe Bella Vista’s greatest resource isn’t a building, a road, a lake, or a trail. It’s our people. When we listen to one another, learn from one another, and work together, there is very little we cannot accomplish.',
  ],
  cta: 'Join the campaign',
} as const

export type Strength = {
  readonly id: string
  readonly title: string
  readonly body: string
}

export const STRENGTHS_EYEBROW = 'What I bring to the table'

export const STRENGTHS: readonly Strength[] = [
  {
    id: 'teacher',
    title: 'A teacher’s heart',
    body: 'For 22 years as an educator, I helped people identify possibilities, overcome challenges, and work toward a better future.',
  },
  {
    id: 'realtor',
    title: 'A Realtor’s problem-solving skills',
    body: 'I listen, negotiate, communicate, solve problems, manage complex situations, and help families make decisions that can affect them for generations.',
  },
  {
    id: 'connector',
    title: 'A connector’s ability to build partnerships',
    body: 'As a community member, I naturally connect people and ideas — bringing people to the table around shared goals.',
  },
  {
    id: 'resident',
    title: 'A resident’s love for Bella Vista',
    body: 'Those experiences have prepared me to serve with curiosity, compassion, common sense, and a willingness to do the work.',
  },
] as const

/** Heading for the full biography, which comes from bio.ts. */
export const BIO_SECTION = {
  eyebrow: 'In her own words',
  heading: 'The long version',
} as const

/** The photographic band that closes the page. */
export const ROOTED_BAND = {
  eyebrow: 'Rooted here',
  line: 'Everything I love about this place has a name and a face.',
} as const
