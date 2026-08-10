/**
 * Ward lookup — and why this file makes no network request.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE ENDPOINT
 * ─────────────────────────────────────────────────────────────────────────────
 * Arkansas VoterView exposes the lookup the mockup wanted, in two steps:
 *
 *   1. GET  /VoterView/Address/GetListOfStreetIdByAddress?AddressValue=…&term=…
 *           → [{ value: 1646756, label: "500 Woodlane Street …" }]  (StreetKey)
 *   2. POST /VoterView/VotingPlace/GetPollingPlaceOrVoteCentersByStreetKey
 *           body: ResidentialAddressValue, StreetKey, hidden,
 *                 __RequestVerificationToken
 *           → an HTML "Where To Vote" page whose Districts section carries the
 *             ward, alongside congressional, judicial, JP, state house and
 *             township.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THE BROWSER CANNOT CALL IT
 * ─────────────────────────────────────────────────────────────────────────────
 * Four independent blockers, any one of which is fatal for a static site:
 *
 * 1. CORS. voterview.ar-nova.org is a state application, not a public API. It
 *    sends no `Access-Control-Allow-Origin`, so a fetch from the campaign's
 *    origin is blocked before it starts.
 *
 * 2. The anti-CSRF token. Step 2 needs a fresh `__RequestVerificationToken`
 *    paired with the session cookie it was minted against. That pairing exists
 *    precisely to stop another origin making this request. We cannot read their
 *    cookie, and a scraped or reused token is rejected — the defence works.
 *
 * 3. It returns HTML, not data. The ward would have to be scraped out of a
 *    rendered page, which breaks the first time they touch their markup —
 *    silently, on a campaign site, during an election.
 *
 * 4. There is no server here. This site is static files; there is nothing to
 *    proxy through.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT IT WOULD TAKE
 * ─────────────────────────────────────────────────────────────────────────────
 * A small server the campaign controls — a Cloudflare Worker is the obvious fit
 * — that loads VoterView to obtain a token and cookie, replays both, parses the
 * districts out of the HTML, and returns JSON. That is a scraper against a
 * state election system from a candidate's website. Before building it someone
 * should decide whether the campaign wants to be doing that, and check
 * VoterView's terms; the token scheme is a fairly clear statement of intent.
 *
 * It also puts voters' home addresses through campaign infrastructure, which is
 * a promise ("Never saved or shared") the campaign would then have to keep.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT THE PAGE DOES INSTEAD
 * ─────────────────────────────────────────────────────────────────────────────
 * Sends people to VoterView itself. It is the authoritative source, it already
 * does this well, and it tells them their polling place — which is the thing
 * they actually need and which no ward number provides.
 *
 * And the framing stays honest either way: Bella Vista elects at large, so the
 * ward a lookup returns does not decide whether someone may vote for Nancy.
 * Every Bella Vista voter can. See AT_LARGE_NOTICE in content/election.ts.
 */

import { OFFICIAL_LINKS } from '../content/election'

/**
 * Where to send someone who typed an address.
 *
 * VoterView's own flow requires picking the address from its autocomplete so a
 * StreetKey is captured, so there is no deep link that can carry the typed text
 * — a query parameter would be dropped and look broken. They land on the tool
 * and enter it once, there.
 */
export function voterLookupUrl(): string {
  return OFFICIAL_LINKS.voterLookup
}
