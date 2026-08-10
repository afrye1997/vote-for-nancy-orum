/**
 * "What this means for you" — three neighbor profiles.
 *
 * Text is the artifact's, which handled this section well: it speaks to
 * different residents without dividing them, and lands on the shared city
 * budget as the common thread.
 *
 * Note none of these are ward-scoped, so §2.6 has nothing to flag here.
 */

export type VoterProfile = {
  readonly id: string
  readonly heading: string
  readonly body: string
}

export const VOTERS_INTRO = {
  eyebrow: 'What this means for you',
  heading: 'Different neighbors. Same city budget.',
} as const

export const VOTER_PROFILES: readonly VoterProfile[] = [
  {
    id: 'longtime',
    heading: 'If you have been here since the POA days',
    body: "You built this place, and a lot of you are on a fixed income. Your property tax bill should not be the city's growth plan.",
  },
  {
    id: 'newcomer',
    heading: 'If you just moved up from Bentonville or Rogers',
    body: 'You should not have to drive back down for the basics, and the roads ought to keep pace with the rooftops going up next to them.',
  },
  {
    id: 'families',
    heading: 'If you are raising kids here',
    body: 'The votes taken this term decide what Bella Vista costs to live in twenty years from now. That is worth paying attention to.',
  },
] as const
