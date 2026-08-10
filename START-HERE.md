# Start here

> **Status, 2026-08-10.** The site is built. Everything below this box describes
> the handoff state the repo was in before the design landed, and is kept
> because the reasoning still holds — particularly "the one rule that matters
> most" and the two non-negotiables.
>
> What exists now: four pages (home, `nancy/`, `platform/`, `involved/`) plus a
> thank-you page and a 404, rendered from `src/content/` into static HTML by
> `scripts/prerender.mjs`. The design comes from the campaign's Claude Design
> project; its tokens are vendored into `src/styles/tokens.css`.
>
> ```bash
> npm run build      # typecheck, bundle, prerender, run the output checks
> npm run preview    # serve dist/
> npm run contrast   # 40 colour pairs, measured (ENGINEERING.md §6)
> npm run lint
> ```
>
> **Before anything renders properly, copy the design project's `assets/` into
> `public/img/`.** See `public/img/README.md` — the twelve files, their sizes,
> and why they could not be fetched automatically.
>
> Of the five launch gates below, two are closed: the committee name and the
> contact email are real (though the committee name still wants one call to the
> county clerk to confirm the exact filed wording). Three remain open — the
> pull quote, the donate URL, and a Web3Forms key for the form. The build tells
> you about the last one every time it runs.
>
> The mockup's ward-address lookup was **not** implemented as designed. It
> fabricated its answers and told eligible voters the race was not on their
> ballot. The reasoning and the replacement are documented at the top of
> `src/content/involved.ts`.

Everything in this folder is **content, facts, and engineering discipline.**
There is no styling of any kind — no CSS, no fonts, no palette, no design
tokens, no Tailwind. The new design starts from nothing.

## What's here

```
ENGINEERING.md            portable practices — read before writing code
RESEARCH.md               verified election facts + AR disclaimer law, all cited
NEEDED-FROM-CAMPAIGN.md   the open list for Nancy

src/content/              ← THE IMPORTANT PART. 808 lines of typed data.
                            Zero className, zero CSS, zero markup.
                            Her verbatim bio and the corrected Census figures.

scripts/prerender.mjs     static site generator + the forbidden-strings scan.
                            Emits document structure only.

package.json, tsconfig*, .oxlintrc.json, vite.config.ts
```

## What was deliberately left behind

| Not included | Why |
|---|---|
| Any CSS or design tokens | New design decides |
| Archivo Black / Source Serif fonts | A typography choice |
| Tailwind (removed from deps and config) | Pick whatever the new design wants |
| `BRAND.md` | Palette and contrast analysis for the old direction |
| `public/img/` derivatives | Sized for the old layout — regenerate at the new dimensions |
| Every component and page | The entire point |

**Source images are still in the old repo's `asset/` folder** — the print
masters, the yard sign, her portrait, and the phone photos. Copy those across
and generate fresh derivatives at whatever sizes the new design calls for.

## Setup

```bash
mkdir nancy-orum-v2 && cd nancy-orum-v2
cp -R /Users/allisonfrye/Desktop/nancy-orum/_carry-forward/. .
git init
npm install
npm install -D <whatever the new design needs for styling>
```

Then write `src/index.css`, `src/components/`, `src/pages/`, and
`src/entry-server.tsx` against the new design.

`prerender.mjs` expects the SSR bundle to export:

```ts
export const PAGES: Array<{ id, out, title, description, path }>
export function renderPage(id: string, opts: { base: string; web3formsKey: string | null }): string
```

Build scripts to add to `package.json`:

```json
"build": "tsc -b && vite build && vite build --ssr src/entry-server.tsx --outDir dist-ssr && node scripts/prerender.mjs"
```

## The one rule that matters most

**Adapt the design to `src/content/`. Never re-type content out of a mockup.**

The original design's statistics failed fact-checking. Three of four were wrong,
and one comparison — *"roughly fifteen times the 2013 pace"* — was measured
against a year where the city reported **no permit data at all**. The
corrections live in `growth.ts` and nowhere else.

If the new build copies numbers off a mockup, it republishes fabricated
statistics under a real candidate's name.

The `prerender.mjs` scan will catch it. **Confirm the scan actually fails on a
deliberate bad value before trusting it.**

## Also non-negotiable, regardless of design

**Bella Vista elects its council AT LARGE.** Nancy must *live* in Ward 2, but
every Bella Vista voter votes on every ward's seat. Copy implying otherwise
tells two-thirds of the city the race isn't theirs. `AT_LARGE_NOTICE` in
`election.ts`; banned phrasings are in the scan.

## Five gates open before launch

They live in the code, not in a TODO list.

| Gate | File | Clears when |
|---|---|---|
| Policy planks unapproved | `priorities.ts` | Nancy confirms all nine commitments, in those words |
| Pullquote unapproved | `bio.ts` | She picks the quote |
| Committee name | `election.ts` | Benton County Clerk, (479) 271-1013 |
| Email + phone | `election.ts` | Real values — the originals were fictional |
| Donate URL | `election.ts` | A real contribution page |
