/**
 * Home-page copy that is not already owned by another module.
 *
 * The growth statistics live in `growth.ts` and the commitment cards in
 * `platform.ts`; the page composes all three. Nothing here restates a number.
 *
 * Source: the campaign's design project, 2026-08-09. The power-message
 * paragraphs are a condensed retelling of the bio in `bio.ts` — the campaign
 * wrote the condensation, so it is used as written rather than reassembled out
 * of her bio paragraphs.
 */

export const POWER_MESSAGE = {
  eyebrow: 'My power message',
  heading: 'We can protect what we love while planning wisely for what comes next.',
  paragraphs: [
    'For more than two decades as an educator and now as a Realtor, my work has centered around people — listening to their needs, bringing people together, navigating complex challenges, and finding practical solutions. I am running for Bella Vista City Council because I believe those same skills are essential as our city plans for its future.',
    'Bella Vista is growing and changing, and with that growth comes both opportunity and responsibility. We need leaders who will listen before making decisions, ask thoughtful questions, communicate openly, build partnerships, and work toward solutions that serve our entire community.',
  ],
  emphasis: 'I believe we can move Bella Vista forward without losing what makes it extraordinary.',
  cta: 'More about Nancy',
} as const

export const VISION = {
  eyebrow: 'The vision',
  items: [
    'Listen before we lead.',
    'Plan instead of simply react.',
    'Learn from successful organizations and communities.',
    'Build partnerships instead of silos.',
    'Solve problems instead of creating division.',
    'Welcome progress while protecting what makes Bella Vista special.',
  ],
  closer: 'And most importantly, we can do it together.',
} as const

/** The band that closes every page. */
export const CTA_BAND = {
  title: 'Bella Vista’s best days can still be ahead of us.',
  sub: 'Let’s build them together.',
} as const

export const HERO_ACTIONS = {
  join: 'Join the campaign',
  about: 'Meet Nancy',
} as const
