# Generated — don't edit by hand

Everything in this folder except this file is written by `npm run images`, from
the originals in `assets/` at the repo root. Editing a file here means losing it
the next time that script runs.

```bash
npm run images    # assets/ -> public/img/, AVIF + fallback for each
```

## Where the originals come from

`assets/` holds the sources for the twelve entries in the script's TARGETS
table, plus two walk-card scans kept for reference. It is gitignored: camera
originals and print masters do not belong in a repository this size.

Nine of the twelve come from the campaign's Claude Design project, which is their
master copy — re-export from there if `assets/` is ever lost. They cannot be
fetched programmatically: the design MCP caps file reads at 256 KiB and every
one of these exceeds it, returning a truncated file that still looks valid and
decodes to a torn image.

⚠ `campaign-booth.jpeg` is **not** in the design project. It came from the
campaign directly, at 2048×1520 — already downscaled, so there is no larger
master to go back to. Re-exporting the design project will not restore it. If
`assets/` is lost, that one has to come from the campaign again.

⚠ The 2026 artwork is **not** in the design project either, and it is the
brand now. Nancy shared the first four from `votenancyorum@gmail.com` on
2026-08-27 as Google Drive files; the two nav lockups came separately on
2026-09-02 and are the only ones supplied ready to use:

| `assets/` file | Drive file | Notes |
|---|---|---|
| `logo-circle-2026.png` | `Circular Logo Text Resize (3).png` | 1545×1999. **Cropped before use** — the supplied file sets the circle on a white page with a decorative dotted rule under it. Cropped to the circle at (48, 116)–(1496, 1564) and given a circular alpha mask, so it does not paint a white square on tinted backgrounds. |
| `yard-sign-2026.png` | `yard sign more tree (2).png` | 3456×2304. Used as-is. |
| `walk-card-front-2026.png` | `1.png` | 1650×1275. Reference only — no target, nothing renders it. Kept because it is where the slogan and the disclaimer wording were read from. |
| `walk-card-back-2026.png` | `2.png` | 1650×1275. Reference only, same reason. |
| `nav-logo-white-2026.png` | `nancy-orum-logo-white-outline.png` | 1536×1024 with alpha. **Cropped** to the union of its own ink and the navy cut's, so the two share one box and the header's swap cannot resize the logo. |
| `nav-logo-navy-2026.png` | `nancy-orum-logo-navy-outline.png` | 1536×1024 with alpha. Same shared crop. |

`large road side banner.png` (19 MB) is in `assets/` as `nav-banner-2026.png`,
cropped to the middle 76% of its width. **Nothing builds a derivative from it** —
it was the header mark briefly on 2026-09-02 and the circular logo replaced it.
Kept because it is the only wide lockup in the new brand. Note it is over the
10 MB cap on programmatic Drive downloads, so if `assets/` is lost this one has
to be saved out of Drive by hand rather than fetched.

⚠ `assets/nancy-creek-2026-EXTRACTED.png` is **staged, not used, and should not
be used as it stands.** The candidate asked on 2026-09-02 for the creek
photograph on the back of her walk card to go on the site. That photograph exists
here only inside the printed card, with "NANCY" and "ORUM" set across it, so this
is the largest rectangle of it that carries no type: **515×688**. The About page
portrait it would naturally replace is 1200×800 and renders at up to 600 CSS
pixels wide, which needs about 1200 real ones. Shipping this would put a visibly
soft picture of the candidate on the page about her.

Ask her designer for the original camera file — it certainly exists, because the
card was made from it — and then this extract can be deleted.

The design project is **not** the master for these four — her Drive is. If
`assets/` is lost, re-exporting the design project restores the twelve older
files and none of these.

| File | Used by |
|---|---|
| `hero-arms-crossed.jpeg` | Home hero |
| `campaign-booth.jpeg` | Platform commitment 4 |
| `nancy-orum-headshot.jpeg` | Platform commitment 5 |
| `community-event.jpeg` | Get involved hero; platform commitment 1 |
| `family-square.jpeg` | About "rooted here" band; platform commitment 2 |
| `tanyard-creek-falls.png` | Platform commitment 3 |
| `about-arkansas.png` | About page portrait |
| `nav-logo-white-2026.png` | Header on the dark pages (home, get involved) |
| `nav-logo-navy-2026.png` | Header on the light pages, and on every page below 900px |
| `logo-circle-2026.png` | Platform commitment 6; donate page |
| `yard-sign-2026.png` | Footer, the yard-sign request block on the form, and the foot of the home statement |
| `ward-map-2022.png` | "See the ward map" disclosure |

## What the script does

Each original becomes two files at the same size: an **AVIF**, and a **PNG or
JPEG fallback**. Components render both through a `<picture>`, so any given
visitor downloads exactly one.

38.8 MB of originals become **1.8 MB served to a modern browser**, or 6.2 MB to
a browser too old for AVIF (Safari before 16.4). The script prints both totals
every time it runs; these are its 2026-08-27 figures.

Target sizes are twice each image's largest CSS display width, capped at 1800 for
the full-bleed photographs — those sit under a heavy navy scrim, where finer
detail is detail nobody can see. The table lives at the top of
`scripts/images.mjs`.

Alpha decides the fallback format. `about-arkansas`, `logo-circle-2026` and the
ward map are transparent and stay PNG; flattening them would put a white box
around the artwork. The rest become JPEG, the header mark included — it is a
painted sign with no transparency in it.

## Two checks you can't get around

`scripts/prerender.mjs` fails the build if either breaks:

1. **Every referenced image exists**, AVIF and fallback both. A warning during
   local work, a hard failure once `SITE_ORIGIN` is set.
2. **Every `width`/`height` in the markup matches the real file.** The
   attributes exist to reserve the right box before the bytes land; one that
   disagrees produces exactly the layout shift it was meant to prevent, and does
   it invisibly, because the picture still appears.

So if you retarget a size in `scripts/images.mjs`, the build will tell you to
update `src/content/images.ts`. The script prints the numbers to paste in.

## Still outstanding

- ~~A nav lockup with a transparent background~~ (NEEDED-FROM-CAMPAIGN.md §8) —
  **closed 2026-09-02, and not the way it was asked.** The request assumed the
  header needed a mark it could recolour per surface. It needed a mark that does
  answered properly on 2026-09-02: the campaign supplied the new lockup as two
  knockouts with real alpha, `nav-logo-white-2026.png` and
  `nav-logo-navy-2026.png`. The header picks by page tone, as it always did.

  Two other marks were tried in that slot the same day and rejected. A wide
  painted crop of the roadside banner needed a rounded edge and a shadow to look
  bounded, which made it read as a picture stuck to the page; the circular logo
  was cleaner but is square, and a wordmark reads faster in a header. Both are
  still in `assets/`; only the circle still builds, for the donate page and the
  last commitment card.
- **`og-card.jpg`** — the social preview. `scripts/prerender.mjs` emits
  `og:image` only when `SITE_ORIGIN` is set, and expects the file at
  `/img/og-card.jpg`. It is not generated from `assets/`; add it here directly,
  1200×630.
