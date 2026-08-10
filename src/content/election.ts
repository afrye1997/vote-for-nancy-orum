/**
 * Verified election facts for the November 3, 2026 Bella Vista general election.
 *
 * Every value here survived independent adversarial verification against primary
 * sources on 2026-08-03. Citations are in RESEARCH.md §2.
 *
 * RULES FOR THIS FILE
 * - Nothing goes in without a primary source. No "probably", no inference.
 * - Dates are stored as both an ISO string (for <time dateTime>) and a
 *   pre-formatted display string. We do NOT construct Date objects from these:
 *   `new Date('2026-11-03')` parses as UTC midnight and renders as Nov 2 for
 *   every user west of Greenwich — which is all of Arkansas.
 * - If a fact becomes unverifiable or changes, delete it. Do not downgrade it
 *   to a guess.
 */

export type KeyDate = {
  /** ISO 8601, for the `dateTime` attribute on <time>. */
  readonly iso: string
  /** Human-readable, pre-formatted. Never derived from `iso` at runtime. */
  readonly display: string
  readonly label: string
  readonly detail?: string
}

export const GENERAL_ELECTION: KeyDate = {
  iso: '2026-11-03',
  display: 'Tuesday, November 3, 2026',
  label: 'Election Day',
} as const

/**
 * Ordered earliest to latest — components render this directly rather than
 * re-sorting, so the order here is the order on the page.
 */
export const KEY_DATES: readonly KeyDate[] = [
  {
    iso: '2026-10-05',
    display: 'Monday, October 5, 2026',
    label: 'Voter registration deadline',
    // The statutory date is Oct 4, which falls on a Sunday and is extended to
    // the next business day under Ark. Code § 7-1-108. Publish Oct 5.
    detail: 'Arkansas registration is by paper form only — there is no online option.',
  },
  {
    iso: '2026-10-19',
    display: 'Monday, October 19, 2026',
    label: 'Early voting begins',
    detail: 'Weekdays 8am–6pm, Saturdays 10am–4pm. Satellite location hours may differ.',
  },
  {
    iso: '2026-11-02',
    display: 'Monday, November 2, 2026',
    label: 'Early voting ends',
    detail: 'Closes at 5:00pm.',
  },
  GENERAL_ELECTION,
] as const

/**
 * A runoff happens only if no candidate wins outright — a majority, or a
 * plurality of at least 40% with a 20-point margin over second place.
 * Ark. Code § 7-5-106. Do not surface this unless a runoff is actually called;
 * publishing a conditional second election date before it exists confuses voters.
 */
export const POSSIBLE_RUNOFF: KeyDate = {
  iso: '2026-12-01',
  display: 'Tuesday, December 1, 2026',
  label: 'Runoff, if one is required',
} as const

export const OFFICIAL_LINKS = {
  /** Check registration status and find your polling place. */
  voterLookup: 'https://www.voterview.ar-nova.org/VoterView',
  /** Arkansas has no online registration — this is the paper form. */
  registrationFormEnglish:
    'https://www.sos.arkansas.gov/uploads/elections/Voter_Reg_App._8-2023_.pdf',
  registrationFormSpanish:
    'https://www.sos.arkansas.gov/uploads/elections/voter_reg_ap_ar_spanish.pdf',
  bentonCountyElectionCommission: 'https://bentoncountyar.gov/election-commission/',
  /** Note the .com — the Arkansas Ethics Commission is NOT on a .gov domain. */
  arkansasEthicsCommission: 'https://www.arkansasethics.com/guidance-for-municipal-candidates/',
} as const

export const RACE = {
  candidate: 'Nancy Orum',
  city: 'Bella Vista',
  state: 'AR',
  office: 'City Council',
  ward: 2,
  position: 2,
  /** Confirmed filed by the campaign, 2026-08-03. Filing closed noon Aug 5, 2026. */
  hasFiled: true,
} as const

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * AT-LARGE VOTING — the single most important messaging constraint on this site
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Bella Vista council members are elected AT LARGE. A candidate must LIVE in the
 * ward they represent, but EVERY Bella Vista voter votes on EVERY ward's seat.
 *
 * This is settled for November 2026: Act 283 of 2025 required any by-ward
 * opt-out ordinance to be filed by January 1, 2026, and that date has passed.
 *
 * WHY THIS MATTERS MORE THAN IT LOOKS
 * Copy like "Ward 2 residents: vote Nancy Orum" is the natural thing to write
 * and it is actively harmful. It tells roughly two-thirds of the city that this
 * race is not theirs, suppressing turnout among voters who are in fact eligible
 * to vote for her. The error costs real votes.
 *
 * THE RULE
 * - Ward 2 describes WHERE NANCY LIVES and WHICH SEAT she seeks.
 * - Ward 2 NEVER describes who may vote for her. That is the whole city.
 * - Any voting call-to-action addresses all Bella Vista voters.
 *
 * Her printed signs already get this right: "BELLA VISTA, AR" is the primary
 * line, with "CITY COUNCIL-WARD 2" as the qualifier beneath it. Match that.
 */
export const AT_LARGE_NOTICE = {
  short: 'Every Bella Vista voter votes in this race.',
  full:
    'Bella Vista City Council members are elected at large. Candidates must live in ' +
    'the ward they represent, but every Bella Vista voter votes on every ward’s seat — ' +
    'so this race is on your ballot no matter where in the city you live.',
} as const

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * LEGAL PLACEHOLDERS
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Any legally-significant value we do not yet know renders as this literal
 * string, in bold, on the page. It is meant to be impossible to miss.
 *
 * The alternative — rendering nothing, or a plausible guess — is worse. A blank
 * footer looks finished. A guessed committee name looks finished AND misstates
 * a legal filing. A bold INSERT HERE looks broken, which is the point: it is
 * broken, and it should stay conspicuous until a human supplies the real value.
 *
 * `hasUnresolvedLegalText()` is what Gate 3 asserts against. It must return
 * false before launch.
 */
export const LEGAL_PLACEHOLDER = 'INSERT HERE'

/**
 * Registered campaign committee name, needed verbatim for the footer disclaimer.
 *
 * SUPPLIED 2026-08-09, from the campaign's own design project rather than from
 * the printed artwork. The distinction matters: the signs read "the committee
 * to elect Nancy Orum", which is how a designer set the type, whereas this is
 * the string the campaign wrote into its site file.
 *
 * ⚠ STILL WORTH ONE PHONE CALL. NEEDED-FROM-CAMPAIGN.md §2 asks for the name
 * exactly as filed, and nobody has yet compared this against the filing itself.
 * Capitalisation is the usual discrepancy. Benton County Clerk, (479) 271-1013.
 * If it differs, change it here — this is the only place it appears.
 */
export const COMMITTEE_NAME: string = 'Committee to Elect Nancy Orum'

/**
 * Contact details.
 *
 * The artifact shipped "(479) 555-1234" and "hello@nancyorum.com". Both were
 * hazards of a specific kind: they look real enough to survive a proofread. A
 * 555 number is the number used in movies, and that address does not resolve
 * until the domain is bought — a volunteer who writes to it gets silence, and
 * the campaign never learns they tried. Both are in the build's forbidden
 * strings so neither can come back.
 *
 * The email and Facebook page below are the campaign's, supplied 2026-08-09.
 *
 * `phone` is null, not a placeholder: publishing no phone number is a normal
 * choice for a local race (NEEDED-FROM-CAMPAIGN.md §4) and null renders nothing
 * at all, where a placeholder would render a launch-blocking INSERT HERE for a
 * field the campaign may never want to fill.
 */
export const CONTACT = {
  email: 'votenancyorum@gmail.com',
  /** null publishes no phone number. A string here would be rendered as-is. */
  phone: null as string | null,
  /** null renders no Facebook link at all, rather than a dead href="#". */
  facebookUrl: 'https://www.facebook.com/profile.php?id=61575923382668' as string | null,
} as const

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * DONATIONS
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Set this to the campaign's real contribution page — ActBlue, WinRed, Anedot,
 * or whatever processor the committee actually uses.
 *
 * While it is null the Donate button renders as DISABLED with a visible
 * "not set up yet" note. It is deliberately NOT hidden: the campaign asked for
 * the button, so it should be visible and obviously unfinished rather than
 * quietly missing. And a live-looking Donate button pointing nowhere is the
 * worst of the three options — a supporter who clicks it and lands on an error
 * page usually does not come back.
 *
 * THINGS THE CAMPAIGN NEEDS BEFORE THIS GOES LIVE (see RESEARCH.md §4):
 * - A registered committee with a bank account. Contributions cannot be
 *   accepted personally.
 * - Arkansas Ethics Commission reporting obligations scale with what is raised:
 *   the preelection C&E report is waived under $500 raised/spent, and crossing
 *   $5,000 triggers MONTHLY reports. Turning on donations changes her filing
 *   burden, so this should be her decision, not a developer's.
 * - The final report on Jan 20, 2027 is required regardless of amounts.
 *
 * We are not lawyers and this is not advice — it is a pointer to the checklist
 * so nobody switches on fundraising without knowing it has consequences.
 */
export const DONATE_URL: string | null = null

/**
 * Every string that must be replaced before launch, so one check covers them
 * all. Gate 3 asserts `hasUnresolvedLegalText() === false`.
 *
 * Nulls are omitted rather than counted as unresolved: a field the campaign has
 * decided not to publish is a decision, not an outstanding task.
 */
const LEGAL_TEXT: readonly (string | null)[] = [COMMITTEE_NAME, CONTACT.email, CONTACT.phone]

export function hasUnresolvedLegalText(): boolean {
  return LEGAL_TEXT.some((text) => text === LEGAL_PLACEHOLDER)
}

/**
 * Render helper for any legally-significant value. A resolved value renders as
 * itself; an unresolved one renders through the `.placeholder` treatment, which
 * is loud on screen and caught by the build's forbidden-strings scan.
 */
export function isPlaceholder(value: string | null): boolean {
  return value === LEGAL_PLACEHOLDER
}
