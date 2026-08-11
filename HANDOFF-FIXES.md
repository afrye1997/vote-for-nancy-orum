# Handoff — outstanding fixes

Rewritten 2026-08-11. The previous version of this file listed the findings of
an audit of `bef7242` / `2ce4ac8`. Every item on it has now been acted on, and
this is the record of what changed, what was decided, and the two things that
still need a real browser.

```bash
npm run build     # with WEB3FORMS_KEY set, or the form does not render
npm run lint
npm run contrast
npm run preview   # :4173
```

⚠ `npm run build` **without** `WEB3FORMS_KEY` renders the "not configured" card
instead of the form, so `#help`, the purpose radios and the submit button are
absent from `dist/`. Testing anything about the form against that build gives
false negatives. All three commands were run green against a build with
`WEB3FORMS_KEY` and `HCAPTCHA_SITE_KEY` set.

---

## Where this is deployed

Nowhere in this repo said so, which cost a round of guessing. The site is a
**Cloudflare Workers static-assets project** — not Pages — and Workers Builds
deploys it on every push to `main`:

    https://vote-for-nancy-orum.votenancyorum.workers.dev

`nancyorum.com` is not bought yet (HANDOFF.md §2). `npx wrangler deployments
list` shows the history; wrangler is already authenticated as
votenancyorum@gmail.com.

⚠ `wrangler pages deploy` is the wrong command and will not update this site —
it would create a separate Pages project of the same name and say nothing about
it. `wrangler.jsonc` has the history of that mistake at the top.

⚠ Do not `npm run deploy` or `wrangler deploy` from a laptop. There is no `.env`
in this project, so a local build has no `WEB3FORMS_KEY` and no
`HCAPTCHA_SITE_KEY`: it would ship the "not configured" card in place of the
form and the captcha switched off, both silently, on a green build. The build
variables live in the Cloudflare dashboard and are read only by Workers Builds.

To check which Web3Forms key is actually live:

```bash
curl -s https://vote-for-nancy-orum.votenancyorum.workers.dev/involved/ \
  | grep -o 'name="access_key" value="[^"]*"'
```

A wrong key fails silently — the form reports success, Web3Forms accepts the
submission, and it lands in somebody else's inbox with no error anywhere.

**An empty commit does not reliably trigger a build.** `12405ea` was pushed with
`--allow-empty` and produced no deployment, where the two real commits before it
each deployed within 40 seconds. Use a commit that changes a file, or "Retry
deployment" in the dashboard.

---

## Still needs a real browser

No browser automation is available on this machine — no Playwright, no
Puppeteer, no devtools MCP — so the two functional fixes were reasoned from the
code and verified only as far as the built HTML. Both are worth ten minutes
against `npm run preview`.

**1. Commitment deep links.** Load `/platform/#commitment-03` and
`#commitment-06`. Check which card is nearest the rail's horizontal centre, and
what the hidden live region (`[aria-live]`) reads — it should say "Commitment 3
of 6" and "Commitment 6 of 6". Then load `/platform/` bare and confirm it still
opens on Commitment 01.

The reasoning behind the fix is written out at the effect in
`PlatformRail.tsx`. The part that was NOT verifiable here is the claim that a
fragment scroll arriving *after* hydration is harmless because a centred card is
already fully in view and the spec's inline alignment for fragment navigation is
`nearest`. That is what the spec says; whether every engine agrees is what the
manual pass is for. If one does not, the effect will need to re-assert on
`load` as well.

**2. Volunteer with another purpose selected.** On `/involved/`, switch to "Ask
a question", then press Volunteer in the header. The join radio should select
itself, the branch should open, and the page should scroll to "How would you
like to help?" with focus in it. Then press Volunteer a second time without
moving — the select should re-open rather than do nothing.

Everything else below is comment, doc or dead-code work and is verified by the
fact that it builds and reads correctly.

---

## Corrections to the previous version of this file

**The swipe hint was already committed.** The old "Working tree state" section
described the mobile swipe-hint pill and the narrow-rail centring as uncommitted
work belonging to someone else. They are in `a656147`. The working tree was
clean at the start of this session apart from this file.

**The header scrim finding was understated.** The old pre-existing item 3 said
`scripts/contrast.mjs` measured a scrim the site does not render. True, and
worse than described: `.site-header::before` was never defined in any
stylesheet. The only rule that mentioned it was a `display: none` for the narrow
bar — an override of nothing, itself dead since whenever the scrim was dropped.
Both the rule and the two fictional contrast pairs are gone.

**The §1 off-by-one theory held up.** The old file was right to insist the
"every link lands on commitment 01" report was wrong. The mechanism now written
into `PlatformRail.tsx` predicts an off-by-one, not a jump to the start, and
matches the measurements that were quoted.

---

## What changed

### Functional

**`src/components/sections/PlatformRail.tsx`** — the effect that jumps to the
first real card once the clones exist now reads an incoming `#commitment-NN`
first, via a new `hashedCommitment()`, and centres that card instead. `setCentre`
follows it, so the live region and the focused-card styling agree.

**`src/components/sections/InvolvedForm.tsx`** — the `#help` effect now checks
the `purpose-join` radio when another purpose is selected, then scrolls the
select into view itself, because the browser's anchor scroll already ran against
an element with no box. The write is a direct DOM write, which is the same
contract as the rest of the file: CSS owns which branch is live and React holds
no opinion about it. A document-level `click` listener covers the second press,
which `hashchange` cannot see.

**`src/reveal.ts`** — `startReveals()` now wraps its work in `try`/`catch`,
reveals everything in the `catch`, and sets `data-reveals-ready` only after
that. The body moved into `observeReveals()`. A throw now costs the animation
instead of the page. The comment claiming an error path already existed has been
replaced with one describing the error path that now does.

**`src/components/sections/PlatformPreview.tsx`** — both flip-card faces are
`<div>`. The front one held an `<h3>` inside a `<span>`, which is invalid.
Nothing in `sections.css` depended on them being inline-level; the built HTML
was checked.

### Comments and docs left over from the header revert

- `src/components/layout/Page.tsx` — said `tone` was not passed down and that
  Header had nothing to decide. Both false. Now says why the prop and the class
  are both load-bearing, and what dropping the prop would cost.
- `src/styles/layout.css` — the "renders the campaign sign, which brings its own
  background" sentence undercut the rule it sat above; rewritten around the
  transparent knockouts, which is why the bar has to be light. The dead
  `.site--dark .site-header::before` rule beside it is deleted. "the desktop
  bar's 108px" is now "the desktop lockup's 140px", which is the real value.
- `src/components/sections/Hero.tsx` and `src/styles/sections.css` — both
  claimed BallotCheck also jumps to `#involved-form`. That button was deleted;
  the `scroll-margin-top` rule stays, its justification no longer names it.
- `HANDOFF.md` — the commitment-cards row under "Known remaining gaps to 1:1"
  described the pre-flip design. Rewritten around the flip.
- `src/content/involved.ts` — `DONATE_ROW.unavailable` no longer describes a
  disabled button.

### Decisions

**`DisabledButton` deleted.** `DonateRow` was its only caller and now argues in
its own note why a dimmed control was the wrong answer. Its `aria-disabled`
reasoning is folded into `SubmitButton`, which is the one place still relying on
it, and `Button.tsx`'s header records where the third component went. Git holds
the rest.

**`BALLOT.involvedCta` kept.** Different case: it is a content string the
campaign owns, and `BallotCheck.tsx` already documents why it was left in place
rather than deleted. Content files legitimately hold copy nothing renders yet.

**`priorities.ts` and `voters.ts` kept, and the approval gate made real.** These
are unapproved policy copy and drafted profiles; deleting a candidate's
unapproved policy text is not a developer's call, and git is a worse home for it
than a file with the warning attached. But the flagged problem was real —
`PRIORITIES_APPROVED_BY_CANDIDATE` "blocks launch" and nothing read it. `PLANKS`
is no longer exported; `approvedPlanks()` is the only way to reach it and throws
while the flag is false. Prerendering runs the SSR bundle in Node, so the first
page that renders these now fails the build. Both files say plainly at the top
that nothing imports them.

### `npm run contrast` output changed

The two `nav ... over header scrim` pairs measured a surface that does not
exist, and both passed. They are replaced by the real one: nav links over the
hero photograph, no scrim, worst case a white pixel. Both fail, at 1.13 and
1.00, and both are shipped — so pairs can now carry a `GAP` marker, which prints
the number but does not set the exit code. A `GAP` pair that starts passing
reports `FIXED?` and *does* fail, so a marker cannot outlive the problem it
describes.

Every `GAP` needs a matching row in `HANDOFF.md` under "Known remaining gaps to
1:1". The header one has had a row there all along.

Reads `48 of 50 pairs pass; 2 accepted gap(s).`

### Pre-existing, now fixed

1. **The deploy docs named the wrong env var** — `wrangler.jsonc` and
   `HANDOFF.md` both said `TURNSTILE_SITE_KEY`; the build reads
   `HCAPTCHA_SITE_KEY`. Both corrected, both with a note saying what the old
   instruction did (a green build with the captcha silently off) so nobody
   re-derives it. The Worker proposal further down `HANDOFF.md` still discusses
   Turnstile, which is correct there — that design verifies it against
   Cloudflare directly rather than through Web3Forms, which is what made it a
   paid feature. The "stays a build variable" wording is now "would be".
2. **`ENGINEERING.md` claimed Tailwind 4.** There is none. The row now describes
   hand-written CSS with custom-property tokens.
3. **The contrast scrim pairs** — above.
4. **`priorities.ts` / `voters.ts`** — above.
5. **GitHub Pages references** — `scripts/prerender.mjs`, `src/pages/NotFound.tsx`
   and `src/content/site.ts` now name the Cloudflare static-assets Worker and its
   `not_found_handling` setting. The `ENGINEERING.md` host row now names the real
   host too. `HANDOFF.md:324` was left alone: it says a prefix is only needed for
   a GitHub Pages project site "which is not the plan", and that is accurate.

### Minor

- `scripts/images.mjs` — "twelve" originals is thirteen, and the size is 47 MB
  measured over exactly the files in `TARGETS`, not the whole of `assets/`.
- `src/styles/sections.css` — the `.donate-row__actions` rule in the ≤1100px
  block could never fire. `DonateRow` has one call site and it is inside
  `.involved-split__aside`, whose descendant selector outranks the bare class at
  every width. Deleted, with a note on the rule that does win.
- `index.html` — the reveal-gate comment claimed parity with the built pages.
  It now says the gate is present but inert under `npm run dev`, and points at
  `build && preview` for testing it.

---

## Not touched

- The mobile swipe hint in `PlatformRail.tsx` and `sections.css` (`a656147`).
  Reviewed again in passing and still sound.
- `HANDOFF.md`'s Worker proposal, beyond the two wording fixes above.
- `WEB3FORMS_KEY` is still the tester's key, not the campaign's. That swap has
  to be undone before launch and is tracked separately.

## Already fixed before this session, do not redo

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
images downloaded to `~/Downloads`. Nothing references them, and they are
excluded from the thirteen counted in `images.mjs`. If that treatment is ever
wanted back, the originals need a real home first.
