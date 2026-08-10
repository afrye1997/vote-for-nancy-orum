/**
 * Nancy's biography, supplied by the candidate 2026-08-04.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HER WORDS ARE VERBATIM. DO NOT EDIT THEM.
 * ─────────────────────────────────────────────────────────────────────────────
 * Every string in `FULL_BIO` is exactly as Nancy wrote it, including her
 * punctuation and em-dash style. If a paragraph needs to change, that is her
 * call and hers alone — a developer rewording a candidate's self-description is
 * putting words in her mouth.
 *
 * Selecting WHICH paragraphs appear where is an editorial choice we can make
 * and she can veto. Rewriting them is not.
 */

export type BioParagraph = {
  readonly id: string
  readonly text: string
  /** Where this paragraph is used. Some appear in both places. */
  readonly usage: readonly ('homepage' | 'full')[]
}

/** Her own signature line, used to close the bio. */
export const BIO_SIGNOFF = {
  refrain: 'Listening. Serving. Building Bella Vista Together.',
  name: 'Nancy Orum',
  title: 'Candidate for Bella Vista City Council',
  seat: 'Ward 2, Position 2',
} as const

export const BIO_HEADING = 'Meet Nancy Orum' as const

/**
 * Full text, in her order. `usage` marks the condensed set that runs on the
 * homepage — the artifact's bio slot holds roughly three paragraphs, and the
 * full piece is ~700 words, so it needs its own page.
 */
export const FULL_BIO: readonly BioParagraph[] = [
  {
    id: 'honored',
    text: "Hello, I'm Nancy Orum, and I am honored to be running for Bella Vista City Council, Ward 2, Position 2.",
    usage: ['full'],
  },
  {
    id: 'communities',
    text: 'I believe the greatest communities are built by people who care deeply about one another, who listen with open minds, and who are willing to work together to create a future we can all be proud of.',
    usage: ['full'],
  },
  {
    id: 'service',
    text: 'For me, leadership has never been about a title. It has always been about service.',
    usage: ['homepage', 'full'],
  },
  {
    id: 'family',
    // Note: the children's ages will age out of date. If this is still live in
    // 2027, check with her before letting the numbers ride.
    text: 'My husband, George, and I have been married for 24 years, and Bella Vista is where we have chosen to build our future. Together, we have raised two wonderful children, Lillian (23) and George Thomas (20). Family has shaped who I am and has taught me the importance of relationships, compassion, responsibility, and creating a place where people feel they belong.',
    usage: ['homepage', 'full'],
  },
  {
    id: 'roots',
    text: 'Northwest Arkansas has been home to my family for 27 years, and Bella Vista has been our home since 2019. We chose Bella Vista because we believe it truly is the jewel of Arkansas. We were drawn here by the beauty of our lakes, trails, and natural surroundings, but what captured our hearts was the people—the welcoming spirit, the sense of community, and the feeling that neighbors still matter.',
    usage: ['homepage', 'full'],
  },
  {
    id: 'grateful',
    text: 'Today, I am grateful every day to call Bella Vista home.',
    usage: ['full'],
  },
  {
    id: 'teacher',
    text: 'At my core, I am a teacher.',
    usage: ['homepage', 'full'],
  },
  {
    id: 'teaching-years',
    text: 'For 22 years, including my most recent years with the Bentonville School District, I had the privilege of helping students discover their strengths, overcome obstacles, and believe in what was possible for their future.',
    usage: ['homepage', 'full'],
  },
  {
    id: 'teaching-lesson',
    text: "Teaching taught me one of life's most important lessons: every person wants to be heard, valued, and respected.",
    usage: ['full'],
  },
  {
    id: 'real-estate',
    text: "That lesson continues to guide me today in my career serving families through real estate. I have the privilege of helping people navigate some of life's biggest transitions, and I love being part of the moments that shape their futures. Whether in a classroom or across a kitchen table, my passion has always been the same—helping people.",
    usage: ['homepage', 'full'],
  },
  {
    id: 'future',
    text: "I believe Bella Vista's future is filled with opportunity and possibility.",
    usage: ['full'],
  },
  {
    id: 'growth',
    text: "Growth is a part of every thriving community, but thoughtful growth requires listening, planning, communication, and respect for the character that makes Bella Vista special. I believe we can welcome progress while protecting the qualities that brought us all here.",
    usage: ['homepage', 'full'],
  },
  {
    id: 'voice',
    text: 'I believe every resident has a voice and something valuable to contribute. Our community is strongest when we come together, share ideas, and find common ground. I value partnership over division, communication over assumptions, and solutions that reflect the needs and hopes of the people we serve.',
    usage: ['full'],
  },
  {
    id: 'character',
    text: 'Those who know me best would describe me as someone who cares deeply about others. I am a nurturer, a connector, and someone who believes small acts of service can create meaningful change. I enjoy bringing people together, building relationships, and finding ways to make the communities around me stronger.',
    usage: ['full'],
  },
  {
    id: 'outdoors',
    text: "When I'm not serving others, you will often find me enjoying Bella Vista's beautiful outdoor spaces, spending quality time with my family, and appreciating the incredible place we are fortunate to call home.",
    usage: ['full'],
  },
  {
    id: 'best-days',
    text: "I am running for City Council because I believe Bella Vista's best days are still ahead of us.",
    usage: ['homepage', 'full'],
  },
  {
    id: 'closing',
    text: "Bella Vista isn't just where I live—it is where my family has chosen to build our future. I would be honored to earn your trust, your support, and your vote as we work together to protect what makes Bella Vista extraordinary while thoughtfully preparing for tomorrow.",
    usage: ['full'],
  },
] as const

/** Her four-line credo. Set apart typographically — it is written as a list. */
export const BIO_CREDO: readonly string[] = [
  'I believe in possibility.',
  'I believe in progress.',
  'I believe in partnerships.',
  'I believe in listening first and leading with purpose.',
  'And I believe the strength of Bella Vista will always be found in its people.',
] as const

export const HOMEPAGE_BIO: readonly BioParagraph[] = FULL_BIO.filter((p) =>
  p.usage.includes('homepage'),
)

/**
 * PULLQUOTE — NOT YET APPROVED.
 *
 * The artifact's own note reads: "Do not publish until she approves the exact
 * wording." That instruction stands. This is a PROPOSAL drawn verbatim from her
 * bio, not a decision — the pullquote is the largest type on the page and the
 * line people will quote back at her, so she picks it.
 *
 * Candidates from her text, all verbatim:
 *   1. "Bella Vista isn't just where I live—it is where my family has chosen
 *      to build our future."
 *   2. "Teaching taught me one of life's most important lessons: every person
 *      wants to be heard, valued, and respected."
 *   3. "For me, leadership has never been about a title. It has always been
 *      about service."
 */
export const PULLQUOTE_PROPOSAL = {
  text: "Bella Vista isn't just where I live—it is where my family has chosen to build our future.",
  approved: false,
} as const
