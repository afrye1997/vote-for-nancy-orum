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
 * what it actually shows — where Nancy lives, not who may vote for her.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * AND WHY THE ADDRESS FIELD IS A LINK
 * ─────────────────────────────────────────────────────────────────────────────
 * Arkansas VoterView has the real lookup, but a browser cannot call it: no CORS
 * headers, an anti-CSRF token bound to VoterView's own session cookie, an HTML
 * response rather than JSON, and no server on this side to proxy through.
 * Reaching it would mean the campaign running a scraper against a state
 * election system. The request shape and what a proxy would need are recorded
 * in HANDOFF.md if that is ever worth doing.
 *
 * Until then a text field that ignores what you type and opens a different site
 * is a worse lie than no field. So it is a link, and VoterView answers.
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
  /**
   * The mockup drew an address field. It is a link instead — see the note at
   * the top of this file. A box that does nothing with what you type is worse
   * than no box.
   */
  lookupLede:
    'Arkansas VoterView will tell you your ward, your polling place, and whether ' +
    'your registration is current. It is the state\u2019s own tool and it is the ' +
    'authoritative answer.',
  lookupCta: 'Look it up on VoterView',
  involvedCta: 'Get involved',
  datesHeading: 'Dates worth putting in your phone',
} as const

/**
 * The three things a visitor might be here to do. `submitLabel` changes with
 * the selection, exactly as in the mockup; that switch is CSS, so it survives
 * with JavaScript off. `id` doubles as the branch key — `purpose-join` drives
 * `.form__branch--join` and `.form__submit-label--join` — so renaming one here
 * renames both. Which branch of fields is SENT is a second layer, decided by
 * measuring what CSS hid; see the note at the top of InvolvedForm.tsx.
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
   * Only reachable once the form has hydrated. With JavaScript off the browser
   * posts natively and leaves the page, so there is no in-flight state to
   * describe — which is why none of this has a no-JavaScript counterpart, and
   * why there is no failure copy: a failed send falls back to that same native
   * POST rather than explaining itself.
   *
   * Each state gives the button a short label and the live region a sentence.
   * They differ deliberately: the button's accessible name is re-read when it
   * changes and the region reads its own line, so identical wording in both is
   * heard as a stutter. They must never disagree either — an earlier draft had
   * the region announcing "Sent" while the button still read "Sending…".
   */
  status: {
    /** Replaces the three purpose labels on the button while a POST is in flight. */
    sending: 'Sending…',
    /** The live region, while a POST is in flight. */
    announcing: 'Sending your message to the campaign.',
    /** The button, between a confirmed send and the thank-you page. */
    sent: 'Sent',
    /** The live region, for that same moment. */
    sentAnnouncement: 'Sent. Taking you to the thank-you page.',
  },
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
