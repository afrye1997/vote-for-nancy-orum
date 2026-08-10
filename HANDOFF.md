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
React, per ENGINEERING.md §1. The client bundle is now **70.8 KB gzipped**,
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
| Get involved | Form branching + donate dialog still CSS, not React state | Should move now that it hydrates |
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

**Carousel clones are `aria-hidden` and carry no `id`.** Six commitments,
twelve slides. Without this a screen reader meets each commitment twice and the
`#commitment-03` links break.

---

## Gates the build runs

`npm run build` fails on any of these. All were proven to fail by planting a
deliberate bad value:

- **Forbidden strings** — wrong stats, fictional contacts, at-large violations,
  `INSERT HERE`, `href="#"`.
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
- Worth verifying after wiring: submit the form and confirm it arrives, and that
  a "Request a yard sign" submission carries the address field.

### 2. `SITE_ORIGIN` — needs the domain first

Setting it turns on four things at once:

- `og:image` (**requires `public/img/og-card.jpg`, 1200×630 — does not exist
  yet**; the tag is omitted rather than pointed at a missing file)
- `<link rel="canonical">` on every page
- The form's `redirect` to `/thanks/` — Web3Forms needs an absolute URL, so
  without this it shows its own confirmation page instead of ours
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
