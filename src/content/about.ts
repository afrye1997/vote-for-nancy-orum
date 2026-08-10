/**
 * About-page copy.
 *
 * Source: the campaign's design project, 2026-08-09.
 *
 * This module holds the page's framing only. Nancy's biography itself is in
 * `bio.ts`, verbatim and untouchable, and the About page renders it in full.
 *
 * The mockup's About page has no bio on it — it runs an intro, four cards, and
 * a photograph. Leaving seven hundred words of the candidate's own words
 * unpublished on the page called "About Nancy" is not a design decision anyone
 * actually made; it is what happens when a layout is drawn before the copy
 * arrives. The bio is rendered in the design's own type styles, below the four
 * cards, where the mockup already had a section break.
 */

export const ABOUT_INTRO = {
  eyebrow: 'About Nancy',
  heading: 'Educator. Realtor. Neighbor.',
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
