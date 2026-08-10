# Handoff

Written 2026-08-10, at the end of the session that built this site. Read this
first if you are picking the project up cold. `START-HERE.md` describes the
repo as it was *before* the design landed; this describes what is actually here.

---

## What this is

Nancy Orum's campaign site for Bella Vista City Council, Ward 2, Position 2.
General election **November 3, 2026**.

It implements the campaign's Claude Design mockup — project
`49f5002f-9282-454f-a97e-ba6f8a7737c3`, file `Nancy Orum Campaign Site.dc.html`
— as a prerendered React site that hydrates in the browser.

Repo: https://github.com/afrye1997/vote-for-nancy-orum (public, one commit).

```bash
npm run build      # typecheck, bundle, prerender, run the output gates
npm run preview    # serve dist/ at :4173
npm run contrast   # 44 measured colour pairs
npm run images     # assets/ -> public/img/ derivatives (macOS only)
npm run lint
```

`npm run dev` is not useful — the dev server has no prerendered HTML to hydrate.
Use `build` + `preview`.

---

## Architecture

**Prerender, then hydrate.** `scripts/prerender.mjs` renders every page to a
complete HTML file at build time; `src/entry-client.tsx` hydrates it. Each URL
works with JavaScript off; React takes over an already-painted page.

This changed mid-session. It was originally build-time-only with 0 KB of client
React, per ENGINEERING.md §1. The client bundle is now **74.8 KB gzipped**,
inside §5's 150 KB budget but against §1's stated goal. The decision was
explicit: the carousel, the form branching and the donate dialog should be React
state rather than CSS approximations.

```
src/
  entry-server.tsx     build-time render; exports PAGES, renderPage, renderNotFound
  entry-client.tsx     hydrateRoot from #root + the page-data JSON script
  pages/registry.tsx   THE page-id -> component map. Both entries read it.
  pages/               Home, Nancy, Platform, Involved, Donate, Thanks, NotFound
  components/ui/       zero domain knowledge (Button, Photo, fields)
  components/layout/   Page, Header, Footer, CtaBand
  components/sections/ composed, domain-aware
  content/             every user-facing string, typed
  styles/              tokens (vendored from the design system), base, components,
                       layout, sections
scripts/
  prerender.mjs        writes dist/, runs the output gates
  images.mjs           image pipeline
  contrast.mjs         colour audit
assets/                design-project originals, GITIGNORED (48 MB)
public/img/            generated derivatives, committed (7.5 MB)
```

**Two rules hydration imposes.** Both have already caused bugs:

1. The page-id → component map must live in exactly one place
   (`pages/registry.tsx`). Two switch statements are two chances for the client
   to mount something different than the server rendered, which shows up as the
   page silently reverting to its initial state a moment after load.
2. Initial state must be a constant, never a measurement. Read the DOM in an
   effect. Anything measured during render differs between server and client and
   throws the whole tree away.

---

## The design is the specification

The user's standard is **1:1 with the Claude Design mockup**. Do not improve on
it unsolicited — that was the single biggest source of rework this session.
Deviate only where the mockup is factually wrong or legally dangerous, and say
so in writing.

### Rebuild the visual reference before touching layout

Do not work from the `.dc.html` source. Render the mockup and diff screenshots.
The harness lived in the session scratchpad and is gone; rebuild it:

1. `DesignSync get_file` the `.dc.html`, `support.js`, and the `_ds/**` tokens.
2. Write a minimal `_ds_bundle.js` exporting Button, Card, Input, Select,
   Checkbox, Radio (the six the template imports).
3. Add React 18 UMD `<script>` tags before `support.js` — the runtime needs
   `window.React` and `window.ReactDOM`.
4. Copy `assets/` in, serve, screenshot with headless Chrome.
5. For the non-home screens, copy the HTML and edit `state = { tab: 'home'` to
   `'about'` / `'platform'` / `'involved'`.

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --hide-scrollbars --virtual-time-budget=6000 \
  --window-size=1440,2400 --screenshot=out.png http://localhost:4173/nancy/
```

### Known remaining gaps to 1:1

| Page | Gap | Status |
|---|---|---|
| Get involved | Ward-address lookup replaced by a ballot explainer | Deliberate, see below |
| Get involved | Election dates section added | Not in the mockup — remove for strict 1:1 |
| Get involved | Donate dialog still CSS, not React state | `DonateRow.tsx` argues it should stay a page |
| About | Full bio removed to match | `<Biography />` still exists, one line to restore |
| All | Header has no scrim, per the mockup | Nav fails 4.5:1 on the Get involved hero |
| Home | Entrance animations compressed from 2300ms to 520ms | End state identical |

---

## Decisions that must not be quietly reversed

**Growth figures.** Three of the mockup's four stats failed fact-checking
against primary Census files. `30,102` appears in no Census product, `33,274` is
superseded, and "fifteen times the 2013 pace" was measured against a year Bella
Vista reported no permit data at all. Correct values live in `content/growth.ts`
and the build fails if the old ones reappear.

**At-large voting.** Bella Vista elects its council at large. Candidates must
live in the ward they represent, but every city voter votes on every ward's
seat. The mockup's `services/wardCheck.js` fabricated a result from address
digit parity and told voters outside Ward 2 "this race won't be on your ballot"
— false, and it suppresses turnout among eligible voters. Replaced by a ballot
explainer plus a link to the state's real voter lookup. Reasoning is at the top
of `content/involved.ts`; the harmful phrasings are in the forbidden-strings
scan.

**The ward lookup is a link, not a field.** Arkansas VoterView has the real
data, in two steps:

```
GET  /VoterView/Address/GetListOfStreetIdByAddress?AddressValue=…&term=…
     -> [{ value: 1646756, label: "500 Woodlane Street …" }]   (StreetKey)
POST /VoterView/VotingPlace/GetPollingPlaceOrVoteCentersByStreetKey
     body: ResidentialAddressValue, StreetKey, hidden, __RequestVerificationToken
     -> HTML "Where To Vote" page; Districts section carries the ward
```

A browser cannot call it. No CORS headers; the `__RequestVerificationToken`
must be fresh and paired with the session cookie it was minted against, which
is exactly the defence that stops another origin doing this; the response is
HTML, not JSON; and this site has no server to proxy through. Making it work
means a Worker the campaign runs that holds a VoterView session and scrapes the
districts out — a scraper against a state election system from a candidate's
site, plus voters' home addresses passing through campaign infrastructure. That
is a decision for the campaign, not a detail of a form control.

Note also that the ward does not decide eligibility, so even a perfect lookup
answers the wrong question. VoterView additionally gives them their polling
place, which is what they actually need.

**Carousel clones are `aria-hidden` and carry no `id`.** Six commitments,
twelve slides. Without this a screen reader meets each commitment twice and the
`#commitment-03` links break.

---

## Gates the build runs

`npm run build` fails on any of these. All were proven to fail by planting a
deliberate bad value:

- **Forbidden strings** — wrong stats, fictional contacts, at-large violations,
  `INSERT HERE`, `href="#"`, and ` disabled=""` anywhere in the prerendered HTML.
  The last one is the form's no-JavaScript floor: CSS reveals a branch on
  `:checked`, and a revealed field that was prerendered `disabled` can never be
  filled in. React may only add `disabled` after hydration.
  ⚠ **That gate only means something on a build with `WEB3FORMS_KEY` set**, since
  without a key the involved page renders a card instead of a form and the scan
  has no controls to look at. The build now fails if a keyed build produces no
  `<form>`, and warns loudly on a keyless one that the check did not run. A plain
  `npm run build` is not evidence here.
- **Missing images** — every referenced file present in both AVIF and fallback.
  A warning normally; a hard failure once `SITE_ORIGIN` is set.
- **Image dimensions** — every `width`/`height` attribute checked against the
  real file header. A mismatch reserves the wrong box and shifts layout
  silently.
- **Approval gate** — `PLATFORM_APPROVED_BY_CANDIDATE` in `content/platform.ts`.

`npm run contrast` is separate and not yet wired into the build.

---

## The three things still blocking launch

### 1. Web3Forms key — the form does not submit without it

Until it is set, `/involved/` renders a card saying the form is not connected,
rather than pretending to accept submissions and discarding them.

- Get a key at **web3forms.com** — enter a destination email, copy the key.
  Free, no account.
- **The campaign must decide which inbox.** Every submission lands there.
  See NEEDED-FROM-CAMPAIGN.md §7.
- Build with it: `WEB3FORMS_KEY=xxxxxxxx npm run build`
- Where it lands: `scripts/prerender.mjs` → `renderOpts` → `Involved` →
  `InvolvedForm`, as a hidden `access_key` input.
- The key is embedded in the public HTML. That is how Web3Forms works — access
  keys are public by design — but say so before anyone is surprised.
- 🚩 **LAUNCH BLOCKER, not a nice-to-have: submit once on each path against the
  real key before going live.** They are two different code paths and neither has
  ever completed against the live API. Web3Forms answers every non-browser client
  with a 403 — every `curl` attempt fails, including the preflight — so there is
  no way to write a CI smoke test for this. It has to be a human in a browser.
  - **JavaScript on.** Confirm the email arrives, that a "Request a yard sign"
    submission carries the address field and a question does not, and that the
    browser lands on the campaign's own `/thanks/`. This is the run that proves
    the one unproven assumption in the whole design: that a multipart POST with
    `redirect` stripped comes back as readable JSON with `success: true`. If it
    does not, every submission is delivered twice and nobody reaches `/thanks/` —
    and nothing on screen would say so.
  - **JavaScript off** (devtools ▸ Settings ▸ Debugger ▸ Disable JavaScript).
    Confirm the email arrives and, once `SITE_ORIGIN` is set, that the redirect
    lands on `/thanks/`. Note this path is the one that must work, and it is
    `x-www-form-urlencoded` — the encoding the vendor warns against. That warning
    is about reading the answer as JSON; a native navigation wants the 3xx it
    returns. Prove it anyway.
  - **Check the `Reply-To` header on the mail that arrives.** See the note below.
- ⚠ **`Reply-To` may not be set, and the form promises it is.** The email input
  is `name="Email"` with a capital E, because these names are the labels the
  campaign reads in its inbox. Web3Forms documents the reply-to address as coming
  from a field named `email`, lowercase, in every example. If the header comes
  back unset, replying to a constituent goes to Web3Forms rather than to them —
  and the question branch's own hint says *"Nancy answers her own email — you'll
  hear back at the address above."* The fix is one lowercase letter in
  `InvolvedForm.tsx` (`name="Email"` → `name="email"`), at the cost of a
  lowercase label in the notification email. Deliberately not applied blind; do
  it the moment the header proves absent.
- ⚠ **Tell the campaign that the notification emails change shape.** A hidden
  branch's fields are left out of the submission rather than arriving blank, so a
  question email is now five fields instead of nine. The consequence worth
  flagging: a question or a yard-sign request no longer carries
  `Wants updates: yes`, which until now every submission carried, harvested from
  a checkbox two thirds of visitors never saw. That is a consent fix, not a bug,
  but it changes who ends up on the mailing list and it is the campaign's call,
  not a developer's. Two qualifications they need with it:
  - **It applies to visitors with JavaScript only.** With the bundle off nothing
    is disabled and every submission still carries `Wants updates: yes`, exactly
    as today. If consistent consent matters more than the enhancement, the honest
    fix is to stop pre-checking the box rather than to rely on suppression the
    no-JavaScript path never gets.
  - **An absent `Wants updates` is now ambiguous.** It means either "not the join
    branch" or "joined and unticked the box" — an unchecked checkbox has always
    sent nothing. If telling those apart matters, say so and it can be made
    explicit.

### 2. `SITE_ORIGIN` — needs the domain first

Setting it turns on four things at once:

- `og:image` (**requires `public/img/og-card.jpg`, 1200×630 — does not exist
  yet**; the tag is omitted rather than pointed at a missing file)
- `<link rel="canonical">` on every page
- The form's `redirect` to `/thanks/` — Web3Forms needs an absolute URL, so
  without this a **no-JavaScript** submission shows its own confirmation page
  instead of ours. A hydrated browser already reaches `/thanks/` on its own: the
  submit is intercepted, posted with `fetch`, and navigated relatively. That is
  the majority of visitors, and it is why this is no longer launch-blocking
- Missing images become a build failure instead of a warning

Domain is not bought yet. NEEDED-FROM-CAMPAIGN.md §10 recommends
`nancyorum.com` at **Cloudflare Registrar** — sold at cost with free WHOIS
privacy, which keeps a candidate's home address out of public records. Register
the account in the campaign's name, not a developer's. **After purchase, click
the ICANN verification email** — ignoring it suspends the domain.

`SITE_BASE` stays `/`. It only needs a prefix for a GitHub Pages project site,
which is not the plan.

### 3. Committee name — one phone call

The footer reads *"Paid for by the Committee to Elect Nancy Orum"*, taken from
the campaign's own design file. Nobody has compared it against the actual
filing, and capitalisation is the usual discrepancy.

- **Benton County Clerk, (479) 271-1013**, or the filing paperwork.
- Changes in one place: `COMMITTEE_NAME` in `content/election.ts`.
- If it ever reverts to the `INSERT HERE` placeholder, it renders in a loud
  warning style and the build fails — that is deliberate.

Two smaller gates remain open alongside these: `PULLQUOTE_PROPOSAL.approved` in
`content/bio.ts` (she picks the line) and `DONATE_URL` in `content/election.ts`
(read the note there first — turning on fundraising changes her Arkansas Ethics
Commission filing burden, so it is her call, not a developer's).

---

## Gotchas that cost real time

Every one of these was found the hard way.

- **`img { height: auto }` is not optional.** `width`/`height` attributes are
  presentational hints that set a real height. The moment CSS changes the width,
  the height does not follow and the image stretches. The About portrait
  rendered 606×800 from a 1200×800 source.
- **The mockup has no `box-sizing` reset.** Its `max-width: 1120px` applies to
  the content box, so its containers are really 1184px. With a border-box reset
  every column is 64px narrower and every headline rewraps. `.container` adds
  the gutters back.
- **EXIF orientation does not survive `sips`.** `family-square.jpeg` is stored
  upside down with a tag asking viewers to rotate it, so it looks correct
  everywhere until you resample it. `scripts/images.mjs` bakes all eight
  orientations in.
- **`display: contents` on `<picture>` is fragile in flex and grid.** It
  dissolves the element and promotes its children into the parent's layout,
  which broke `justify-content: space-between` in the footer. Wrap it.
- **The design MCP truncates files at 256 KiB.** Every image comes back torn but
  still looking like a valid file. Check the `truncated` flag. Images must be
  exported by hand; the truncated prefix is still enough to read intrinsic
  dimensions out of the PNG header or EXIF block.
- **Headless Chrome floors the viewport at 500px.** A `--window-size=430`
  screenshot is a *crop* of a 500px render and looks like catastrophic overflow.
  Test narrow layouts through an iframe, which gets its own viewport.
- **Headless Chrome under `--virtual-time-budget` does not run the rendering
  lifecycle.** Measured: zero `requestAnimationFrame` callbacks, zero
  `IntersectionObserver` callbacks, zero scroll events. So the carousel's
  settle-and-teleport and the stats count-up cannot be verified there — not
  because they are broken, but because nothing that drives them ever fires.
  Verify structure and hydration programmatically (slide counts, ids, computed
  styles, `__reactFiber$` keys on a node), then confirm motion by eye. Do not
  read "the value never changed" as a bug without checking this first.

---

## Things the campaign still owes

From NEEDED-FROM-CAMPAIGN.md, still open: a logo with a transparent background
(both nav lockups have the gradient baked in, which is why the header ships two
files and swaps between them), and the `og-card.jpg` social preview.

Worth raising with them: the Get Involved hero photograph has a legible phone
number and "Bentonville, AR 72712" on a realty banner behind Nancy — her Keller
Williams branding, on a campaign page. And `hero-arms-crossed.jpeg` and
`nancy-orum-headshot.jpeg` are byte-identical, so the same photograph appears
three times, including on two adjacent platform cards. The user has said that is
fine for now.
