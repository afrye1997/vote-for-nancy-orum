# Handoff — outstanding fixes

Written 2026-08-11, after the revision session that produced `bef7242` and
`2ce4ac8`. Everything below was found by auditing that work afterwards.

**Read this first:** the session changed the header several times and ended by
reverting it to the mockup's original two-file tone swap. Most of what follows
is debris from that revert — comments and docs describing an intermediate state
that no longer exists. Two items are functional bugs. Four are pre-existing and
predate the session; they are marked as such so you do not go looking for them
in the diff.

Verify before you fix. Every claim here was measured, and the measurement is
quoted. One agent-reported finding turned out to be wrong on the details (see
§1) — treat the numbers as the record, not the prose.

```bash
npm run build     # with WEB3FORMS_KEY set, or the form does not render
npm run lint
npm run contrast
npm run preview   # :4173
```

⚠ `npm run build` **without** `WEB3FORMS_KEY` renders the "not configured" card
instead of the form, so `#help`, the purpose radios and the submit button are
absent from `dist/`. Testing anything about the form against that build gives
false negatives — this caught me once already.

---

## Working tree state

Clean. What this section described as uncommitted went in as `a656147`, after
this document was written: the mobile swipe-hint pill in
`src/components/sections/PlatformRail.tsx` and `src/styles/sections.css`, the
narrow-rail centring beside it, and the stacked flip-card spacing on the home
preview. Reviewed and sound: the pill is hidden on desktop, shows once per load
when the rail scrolls into view on touch, auto-dismisses after 3600ms or on
`pointerdown`, is `pointer-events: none` throughout, and its hand animation is
gated behind `prefers-reduced-motion`. It is also gated on a real touch screen
rather than on window width, so a narrowed desktop window will not show it —
that is deliberate, not a bug to chase.

`a656147` changed only CSS on the flip cards. §4 below, on the invalid `<h3>`
inside a `<span>`, is untouched by it and still stands.

Everything described below is committed and deployed. Cloudflare builds on
every push to `main`.

---

## 1. Commitment deep links land on the wrong card — FUNCTIONAL

**`src/components/sections/PlatformRail.tsx`**

Every flip card on the home page links to `platform/#commitment-NN`. Measured
against the built site, they are off by one:

```
#commitment-01 -> centres Commitment 01   correct
#commitment-03 -> centres Commitment 02   WRONG
#commitment-06 -> centres Commitment 05   WRONG
```

An agent reported this as "every link lands on commitment 01". That is not what
happens — it is a consistent off-by-one. Measure again before theorising.

The suspect is the interaction between the browser's native anchor scroll and
the rail's own centring: `ready` flips true in an effect after hydration, the
clones are inserted, and the effect at `PlatformRail.tsx` (the one commented
"Once the clones exist, jump to the first real card") sets `rail.scrollLeft`
directly. Whatever the browser did for the anchor is overwritten, and the
"nearest to centre" logic then resolves to a neighbour.

A fix needs to honour an incoming `#commitment-NN` hash instead of
unconditionally jumping to `CLONES`. Note the ids are two-digit strings
(`'01'`…`'06'`), and only the real (non-clone) planks carry them.

**Test:** load `/platform/#commitment-03` and `#commitment-06` and check which
card is nearest the rail's horizontal centre, and what the hidden live region
(`[aria-live]`) reads.

## 2. Header "Volunteer" is dead once the purpose is switched — FUNCTIONAL

**`src/components/sections/InvolvedForm.tsx`**, the `#help` effect

Volunteer points at `involved/#help`, the "How would you like to help?" select.
That select lives inside `.form__branch--join`, which CSS hides whenever another
purpose is checked:

```
purpose-join      branch display flex   reachable
purpose-question  branch display none   NO — anchor and focus both fail
purpose-sign      branch display none   NO
```

A fresh arrival is fine, because join is the default. It breaks for anyone who
has already switched to "Ask a question" or "Request a yard sign" and then
presses Volunteer — the anchor scrolls nowhere and `focus()` silently no-ops on
a `display: none` element.

Options, roughly in order of preference: have the effect check the join radio
before focusing (it is the branch Volunteer means, so selecting it is honest);
or fall back to `#involved-form` when `#help` is not rendered; or move the
select out of the branch. Do not "fix" it by making the field always visible —
read the note at the top of `InvolvedForm.tsx` about why branch fields must
never be `disabled` and why exclusion is measured at submit.

**Related, smaller:** pressing Volunteer a second time while already on the page
does nothing, because `hashchange` does not fire when the hash is unchanged. A
`click` handler on same-page anchors, or clearing the hash on dismiss, would
cover it.

## 3. `reveal.ts` disarms its own safety net before doing the work

**`src/reveal.ts:72`**

`startReveals()` sets `data-reveals-ready` as its first statement, before
querying targets or constructing the observer. The inline head script (see
`REVEAL_GATE` in `scripts/prerender.mjs`) treats that attribute as proof the
bundle is healthy and skips its bail-out. So if anything after line 72 throws,
the attribute is already set, the bail-out never runs, and every `.reveal` block
stays at `opacity: 0` permanently — the exact fail-closed outcome the
three-gate design exists to prevent.

The comment above it claims a throw is safe because "those are handled by
revealing everything on the error path". There is no error path. Either add one
(wrap the body in `try/catch` and reveal everything in the `catch`), or move the
`setAttribute` to the end of the successful path. Then correct the comment.

## 4. Invalid HTML in the flip cards

**`src/components/sections/PlatformPreview.tsx:66-69`**

`.plank-card__face--front` is a `<span>` containing an `<h3>`. A heading is flow
content and cannot live inside a phrasing-content element. Browsers recover, but
it is invalid and the parser's repair is not guaranteed to match across engines.

Both faces are `<span>` because they sit inside an `<a>`; that part is fine —
`<a>` is transparent content and may wrap flow content. Making the faces `<div>`
is the smallest correct change. Check nothing in `sections.css` depends on them
being inline-level first (they are `display: flex` already, so it should be
inert).

## 5. Comments and docs left describing the reverted header — ALL FROM THE REVERT

These contradict the code as shipped. Grouped because they share one cause.

**`src/components/layout/Page.tsx:14-17`** — the worst of them. Says `tone` "is
applied here rather than passed down" and that "Header itself no longer has
anything to decide". Both false: line 35 passes `tone={tone}`, and `Header.tsx`
uses it to pick the lockup and to decide whether to emit the ≤900px `<source>`
pair. The operative message is that the prop is inert and removable — which is
precisely the reversal `HANDOFF.md` now forbids under "Decisions that must not
be quietly reversed", with the measurements showing the navy cut puts 99.7% of
its ink below 4.5:1 over the Get involved hero.

**`src/styles/layout.css:278`** — "The header now renders the campaign sign,
which brings its own background and would sit on either bar." It renders the
transparent knockouts, which is the only reason the ≤900px bar has to be light.
This sentence undercuts the rule it sits above.

**`src/styles/layout.css:300`** — "Smaller than the desktop bar's 108px." The
desktop rule is `height: 140px` (`layout.css:87`). 108px exists nowhere in the
project.

**`src/components/sections/Hero.tsx:69`** and **`src/styles/sections.css:1153`**
— both say BallotCheck also jumps to `#involved-form`. That button was deleted
in the same commit. The `scroll-margin-top` rule is still wanted (the hero
button and the anchor both need it); only the justification is stale.

**`HANDOFF.md`**, "Known remaining gaps to 1:1" — the commitment-cards row
describes the pre-flip design ("the prompt occupies its line at all times so
hover cannot reflow the row"). That mechanism was replaced by the flip.

**`src/content/involved.ts:209`** — `DONATE_ROW.unavailable` is documented as
"shown beside the disabled Donate button". The button is a real link to
`donate/` now; nothing on the site is disabled.

## 6. `DisabledButton` is an unused export

**`src/components/ui/Button.tsx:80`**

`DonateRow` was its only caller and now renders a `LinkButton`. Its doc comment
carries real reasoning about `aria-disabled` vs `disabled` keeping a control in
the tab order, which is why it was not deleted on the spot. Decide: keep it as a
design-system primitive, or delete it and let git hold the reasoning.

Same call for **`BALLOT.involvedCta`** in `src/content/involved.ts` — the string
for the removed button, deliberately kept, now referenced only by a comment.

## 7. Minor, in files this session touched

- **`scripts/images.mjs:12` and `:99`** — both say "twelve" originals.
  `campaign-booth.jpeg` made it thirteen.
- **`src/styles/sections.css`** — there is a `.donate-row__actions` rule inside a
  responsive block that can no longer take effect, now that the aside scopes its
  own alignment. Confirm with devtools before deleting.
- **`index.html`** — the reveal-gate comment claims parity with the built pages.
  The dev server has no prerendered HTML to hydrate, so `npm run dev` renders
  nothing at all; the gate there is inert rather than equivalent.

---

## Pre-existing — NOT from this session

Found while auditing. Older than the diff, and worth fixing, but do not go
looking for them in `bef7242`.

1. **The deploy docs name the wrong env var.** `wrangler.jsonc:23` and
   `HANDOFF.md:354` tell the next deployer to set `TURNSTILE_SITE_KEY`. The
   build reads **`HCAPTCHA_SITE_KEY`** (`scripts/prerender.mjs:43`). Turnstile
   was abandoned; following the instructions as written silently leaves the
   captcha off. This is the highest-value item on this list, because it is
   instructions to a human that do not work.
2. **`ENGINEERING.md:18`** says the styling layer is "Tailwind 4 via
   `@tailwindcss/vite`". There is no Tailwind in the project — no dependency, no
   `@theme` block, and `src/styles/` is hand-written CSS.
3. **`scripts/contrast.mjs`** measures `nav link over header scrim` and
   `nav current over header scrim` against a scrim the site does not render —
   the header has no scrim, per the mockup, and that is listed as a known gap.
   Two of the 50 pairs pass for a surface nobody sees, while the real failure
   (nav links over the Get involved hero) is not measured at all.
4. **`src/content/priorities.ts` and `src/content/voters.ts` have no importers.**
   6 KB of typed copy the build never sees. `priorities.ts` is the more
   dangerous of the two: it advertises an approval gate that nothing reads, so
   the gate cannot fire.
5. **Four places say the host is GitHub Pages** — `scripts/prerender.mjs`,
   `src/pages/NotFound.tsx`, `src/content/site.ts`. It is a Cloudflare
   static-assets Worker. The `404.html` justification in particular is written
   about the wrong platform.

---

## Already fixed, do not redo

- The Facebook link (footer pointed at a profile that publishes no title).
- The hover oscillator on the commitment cards — hover is triggered from the
  grid cell, never the rotating card. There is a note in `sections.css`
  explaining why; "simplify this to `.plank-card:hover`" reintroduces the bug.
- Three stale `HANDOFF.md` entries from the header revert, plus the per-page
  lockup measurements, which now live under "Decisions that must not be quietly
  reversed" (`2ce4ac8`).
- The orphaned `nav-sign` asset, its `images.ts` entry and its `images.mjs`
  target.

## Left on this machine only

`assets/nav-sign.png` and `assets/nav-sign-glow.png` are the header artwork from
the reverted treatment. `assets/` is gitignored, and unlike the rest of that
folder these did not come from the Claude Design project — they were generated
images downloaded to `~/Downloads`. Nothing references them. If that treatment
is ever wanted back, the originals need a real home first.
