# Generated — don't edit by hand

Everything in this folder except this file is written by `npm run images`, from
the originals in `assets/` at the repo root. Editing a file here means losing it
the next time that script runs.

```bash
npm run images    # assets/ -> public/img/, AVIF + fallback for each
```

## Where the originals come from

`assets/` holds the twelve files from the campaign's Claude Design project. It
is gitignored: 45 MB of camera originals and 7200px print masters does not
belong in a repository that deploys to GitHub Pages. The design project is their
master copy — re-export from there if `assets/` is ever lost.

They cannot be fetched programmatically. The design MCP caps file reads at
256 KiB and every one of these exceeds it, returning a truncated file that still
looks valid and decodes to a torn image.

| File | Used by |
|---|---|
| `nav-logo.png` | Header, on the dark pages (home, get involved) |
| `nav-logo-navy.png` | Header, on the light pages (about, platform) |
| `hero-arms-crossed.jpeg` | Home hero; platform commitment 4 |
| `nancy-orum-headshot.jpeg` | Platform commitment 5 |
| `community-event.jpeg` | Get involved hero; platform commitment 1 |
| `family-square.jpeg` | About "rooted here" band; platform commitment 2 |
| `tanyard-creek-falls.png` | Platform commitment 3 |
| `about-arkansas.png` | About page portrait |
| `logo-lockup.png` | Platform commitment 6 |
| `footer-sign.png` | Footer |
| `yard-sign-3x6.png` | Yard-sign request block on the form |
| `ward-map-2022.png` | "See the ward map" disclosure |

## What the script does

Each original becomes two files at the same size: an **AVIF**, and a **PNG or
JPEG fallback**. Components render both through a `<picture>`, so any given
visitor downloads exactly one.

45.5 MB of originals become **1.6 MB served to a modern browser**, or 5.8 MB to
a browser too old for AVIF (Safari before 16.4). Home is 0.30 MB all-in.

Target sizes are twice each image's largest CSS display width, capped at 1800 for
the full-bleed photographs — those sit under a heavy navy scrim, where finer
detail is detail nobody can see. The table lives at the top of
`scripts/images.mjs`.

Alpha decides the fallback format. `about-arkansas`, both nav lockups,
`logo-lockup` and the ward map are transparent and stay PNG; flattening them
would put a white box around the artwork. The rest become JPEG.

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

- **A logo with a transparent background** (NEEDED-FROM-CAMPAIGN.md §8). The nav
  lockups have their gradient baked into the picture, which is why the header
  ships two files and swaps between them instead of recolouring one mark.
- **`og-card.jpg`** — the social preview. `scripts/prerender.mjs` emits
  `og:image` only when `SITE_ORIGIN` is set, and expects the file at
  `/img/og-card.jpg`. It is not generated from `assets/`; add it here directly,
  1200×630.
