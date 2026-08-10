/**
 * Get-involved copy: the hero, the ballot explainer, and the contact form.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THERE IS NO ADDRESS LOOKUP HERE
 * ─────────────────────────────────────────────────────────────────────────────
 * The mockup shipped an "Am I in Ward 2?" widget backed by
 * `services/wardCheck.js`. Two things are wrong with it, and only one of them
 * is fixable by writing a real backend.
 *
 * 1. It invents its answer. The mock sums the digits in the address and calls
 *    even numbers in and odd numbers out. A real geocoder would fix that.
 *
 * 2. Its copy is false whatever the backend. The "out" branch reads: "Looks
 *    like you're outside Ward 2. This race won't be on your ballot." Bella
 *    Vista elects its council AT LARGE. Every Bella Vista voter votes on every
 *    ward's seat, so that sentence tells eligible voters not to bother. It is
 *    the exact failure `AT_LARGE_NOTICE` in election.ts exists to prevent, and
 *    it costs real votes.
 *
 * The question the widget asked has a fixed answer, so the block states it
 * instead of pretending to compute it. The ward map stays, relabelled to say
 * what it actually shows — where Nancy lives, not who may vote for her — and
 * the address field is replaced by a link to the state's own voter lookup,
 * which is the only tool here that can tell a visitor something true about
 * their own registration.
 */

export const INVOLVED_HERO = {
  eyebrow: 'Get involved',
  heading: 'Volunteer for an hour. It matters more than you think.',
} as const

export const INVOLVED_INTRO =
  'Strong communities aren’t built in silos — they’re built through relationships. ' +
  'Whether it’s a yard sign, an hour of door knocking, or hosting neighbors for ' +
  'coffee, every bit helps Bella Vista hear this message.'

export const BALLOT = {
  eyebrow: 'Your ballot',
  heading: 'Can I vote for Nancy?',
  answerTitle: 'Yes — if you live in Bella Vista.',
  mapSummary: 'See the ward map',
  /** Says what the map shows, which is not what the mockup's caption implied. */
  mapCaption:
    'Ward 2 is the shaded area. It is where Nancy lives and the seat she is running ' +
    'for — not a limit on who votes in this race. Source: NWARPC, 2022 ward plan.',
  lookupCta: 'Check your registration',
  involvedCta: 'Get involved',
  datesHeading: 'Dates worth putting in your phone',
} as const

/**
 * The three things a visitor might be here to do. `submitLabel` changes with
 * the selection, exactly as in the mockup; the switch is CSS, so it survives
 * with JavaScript off.
 */
export type Purpose = {
  readonly id: string
  readonly value: string
  readonly label: string
  readonly submitLabel: string
}

export const PURPOSES: readonly Purpose[] = [
  {
    id: 'purpose-join',
    value: 'Join the campaign',
    label: 'Join the campaign',
    submitLabel: 'Count me in',
  },
  {
    id: 'purpose-question',
    value: 'Ask a question',
    label: 'Ask a question',
    submitLabel: 'Send my question',
  },
  {
    id: 'purpose-sign',
    value: 'Request a yard sign',
    label: 'Request a yard sign',
    submitLabel: 'Send me a sign',
  },
] as const

export const FORM = {
  title: 'Get in touch',
  purposeLegend: 'What brings you here?',
  firstName: { label: 'First name', placeholder: 'Jane' },
  lastName: { label: 'Last name', placeholder: 'Neighbor' },
  email: { label: 'Email', placeholder: 'you@example.com' },
  help: {
    label: 'How would you like to help?',
    placeholder: 'Choose one',
    options: [
      'Yard sign',
      'Door knocking',
      'Host a meet & greet',
      'Phone calls',
      'Wherever I’m needed',
    ],
  },
  updates: 'Email me campaign updates',
  signOffer: {
    lead: 'Show your support from the curb.',
    body: 'Tell us where to drop it off — we’ll handle the rest.',
    addressLabel: 'Street address (for drop-off)',
    addressPlaceholder: '12 Chelsea Rd, Bella Vista, AR',
  },
  question: {
    label: 'Your question',
    placeholder: 'What would you like to ask Nancy?',
    hint: 'Nancy answers her own email — you’ll hear back at the address above.',
  },
  privacy: 'We’ll never share your information.',
  /**
   * Rendered in place of the form when no Web3Forms key is configured. A form
   * that silently discards submissions is worse than one that says it is not
   * ready: the volunteer thinks they signed up, and the campaign never learns
   * they tried.
   */
  notConfigured: {
    title: 'This form isn’t connected yet.',
    body:
      'It needs a Web3Forms access key before it can deliver anything. Until then, ' +
      'email the campaign directly — that address is in the footer and it is real.',
  },
} as const

export const DONATE_ROW = {
  lead: 'Prefer to chip in?',
  body: 'Every dollar stays right here in Bella Vista.',
  cta: 'Donate',
  /**
   * Shown beside the disabled Donate button while `DONATE_URL` is null. Wording
   * from the mockup's "coming soon" modal, which a static page cannot open.
   */
  unavailable: 'Online donations aren’t open quite yet.',
} as const

export const THANKS = {
  title: 'Thank you, neighbor.',
  body: 'We’ll be in touch soon. It means a lot that you’re willing to help build Bella Vista together.',
  cta: 'Back to the campaign',
} as const
