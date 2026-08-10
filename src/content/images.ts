/**
 * The photographs and artwork, with their real intrinsic dimensions.
 *
 * Every `<img>` on this site ships explicit width and height so the browser can
 * reserve the box before the bytes arrive and the layout cannot shift
 * (ENGINEERING.md §5, CLS < 0.1). Those numbers have to come from somewhere;
 * this is that somewhere.
 *
 * ⚠ THESE ARE THE DERIVATIVES' DIMENSIONS, NOT THE ORIGINALS'.
 * `scripts/images.mjs` owns them. It prints this list every time it runs, and
 * `scripts/prerender.mjs` fails the build if any value here disagrees with the
 * file on disk — so they cannot quietly drift apart.
 *
 * `file` names the fallback. Each one has an AVIF sibling at the same path with
 * an `.avif` extension, which `<Photo>` offers first; see `imgSources`.
 *
 * `focus` is a CSS object-position. Faces sit off-centre in most of these
 * frames, so a plain centre crop decapitates them at narrow widths.
 */

export type Img = {
  readonly file: string
  readonly alt: string
  readonly width: number
  readonly height: number
  readonly focus?: string
}

export const IMAGES = {
  navLogoLight: {
    file: 'nav-logo.png',
    alt: 'Nancy Orum — City Council, Ward 2',
    width: 420,
    height: 280,
  },
  navLogoNavy: {
    file: 'nav-logo-navy.png',
    alt: 'Nancy Orum — City Council, Ward 2',
    width: 420,
    height: 280,
  },
  heroArmsCrossed: {
    file: 'hero-arms-crossed.jpeg',
    alt: 'Nancy Orum at the Bella Vista arboretum entrance',
    width: 1800,
    height: 1200,
    focus: '22% 21%',
  },
  headshot: {
    file: 'nancy-orum-headshot.jpeg',
    alt: 'Nancy Orum at the arboretum',
    width: 1040,
    height: 693,
    focus: '30% 20%',
  },
  communityEvent: {
    file: 'community-event.jpeg',
    alt: 'Nancy Orum talking with neighbours at a community booth',
    width: 1800,
    height: 1350,
    focus: '28% 35%',
  },
  familySquare: {
    file: 'family-square.jpeg',
    alt: 'Nancy Orum with her family on the downtown square',
    width: 1800,
    height: 1350,
    focus: '50% 38%',
  },
  tanyardCreek: {
    file: 'tanyard-creek-falls.jpeg',
    alt: 'Waterfall on a wooded Bella Vista creek',
    width: 1040,
    height: 518,
    focus: '50% 45%',
  },
  aboutArkansas: {
    file: 'about-arkansas.png',
    alt: 'Nancy Orum on a Bella Vista trail, framed in the shape of Arkansas',
    width: 1200,
    height: 800,
  },
  logoLockup: {
    file: 'logo-lockup.png',
    alt: 'Nancy Orum for City Council logo',
    width: 479,
    height: 480,
  },
  footerSign: {
    file: 'footer-sign.jpeg',
    alt: 'Nancy Orum — City Council, Ward 2 — Bella Vista, Arkansas',
    width: 560,
    height: 280,
  },
  yardSign: {
    file: 'yard-sign-3x6.jpeg',
    alt: 'A Nancy Orum for City Council yard sign',
    width: 640,
    height: 320,
  },
  wardMap: {
    file: 'ward-map-2022.png',
    alt: 'Bella Vista ward map, 2022 — Ward 2 shaded in green',
    width: 1280,
    height: 760,
  },
} as const satisfies Record<string, Img>

/** Resolve an image's fallback file to a URL under the deploy base. */
export function imgSrc(base: string, image: Img): string {
  return `${base}img/${image.file}`
}

/**
 * Both encodings of an image: the AVIF a modern browser should take, and the
 * PNG or JPEG everything else falls back to. `scripts/images.mjs` writes the
 * pair, and `scripts/prerender.mjs` checks both exist.
 */
export function imgSources(base: string, image: Img): { avif: string; fallback: string } {
  return {
    avif: `${base}img/${image.file.replace(/\.(png|jpeg)$/, '.avif')}`,
    fallback: imgSrc(base, image),
  }
}
