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
  /**
   * The header lockup, in two cuts — 2026-09-02.
   *
   * The campaign supplied one mark twice: "NANCY", the rules and the banner in
   * white for the photographic pages, and the same in navy for the pale ones.
   * "ORUM" is the watercolour in both. The header picks by page tone.
   *
   * ⚠ IDENTICAL DIMENSIONS, AND THAT IS DELIBERATE. Both files were cropped to
   * one shared box — the union of the two files' ink — rather than each to its
   * own. Below 900px a dark page swaps the navy cut in at the same `<img>`, and
   * two cuts with different aspect ratios would resize the box mid-layout, which
   * is the layout shift the width and height attributes exist to prevent.
   *
   * The cost of the shared box is that the navy cut's ink is a little shorter
   * than the white cut's, so it sits marginally smaller inside the same frame.
   * They are never on screen together, and a stable box is worth more than a
   * matched cap height nobody can compare.
   */
  navLogoWhite: {
    file: 'nav-logo-white-2026.png',
    alt: 'Nancy Orum — Bella Vista, AR — City Council, Ward 2',
    width: 440,
    height: 238,
  },
  navLogoNavy: {
    file: 'nav-logo-navy-2026.png',
    alt: 'Nancy Orum — Bella Vista, AR — City Council, Ward 2',
    width: 440,
    height: 238,
  },
  heroArmsCrossed: {
    file: 'hero-arms-crossed.jpeg',
    alt: 'Nancy Orum at the Bella Vista arboretum entrance',
    width: 1800,
    height: 1200,
    focus: '22% 21%',
  },
  /**
   * ⚠ UNUSED since 2026-09-02, along with `campaignBooth`.
   *
   * Both illustrated commitments the platform page no longer carries, and
   * neither honestly illustrates one of hers. Five of her six have no photograph
   * for the same reason: nothing here shows a road, an intersection, a
   * residential street, a utility, a storefront, or a Police, Fire or EMS crew,
   * and a picture over a policy position is read as evidence for it.
   *
   * Her HEADSHOT is on no page of the site, which is worth fixing.
   *
   * Kept, with their derivatives, because the honest fix is more photographs
   * rather than fewer — see NEEDED-FROM-CAMPAIGN.md §9. `prerender.mjs` only
   * checks that REFERENCED images exist, so nothing fails while they wait.
   */
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
  campaignBooth: {
    file: 'campaign-booth.jpeg',
    alt: 'Nancy Orum at her campaign booth, beside a Nancy Orum for City Council banner',
    width: 1040,
    height: 772,
    /**
     * The card crops this to a 520×220 letterbox, showing a little over half
     * the frame's height. Held high enough to keep the banner's top edge and
     * her face both inside it.
     */
    focus: '50% 38%',
  },
  familySquare: {
    file: 'family-square.jpeg',
    alt: 'Nancy Orum with her family on the downtown square',
    width: 1800,
    height: 1350,
    focus: '50% 38%',
  },
  /**
   * Commitment 03, "Address traffic before development". Supplied 2026-09-02.
   *
   * ⚠ PROVENANCE UNCONFIRMED — DO NOT LAUNCH ON THIS WITHOUT CLEARING IT.
   *
   * Every other photograph on this site came from the campaign or its design
   * project. This one arrived as `Arkansas_Sign_t1684.JPG`: 1500×999, 371 kB,
   * every EXIF tag stripped, no camera make or model, and a `_t1684` suffix of
   * the kind news CMSes append to a resized web copy. That is the signature of a
   * picture saved off a page, not one taken by or for the campaign.
   *
   * It may well be licensed, or a press-release image, or a state agency's. But
   * nobody has said so, and a campaign publishing a newspaper's photograph is the
   * kind of mistake that arrives as a letter. Confirm the source and the licence
   * before this site goes live, or replace it with a photograph the campaign
   * owns — a Bella Vista road is on the list in NEEDED-FROM-CAMPAIGN.md §9.
   *
   * The alt text describes only what is visible. It does not place the road in
   * Bella Vista, because nothing here establishes that it is.
   */
  arkansasHighwaySign: {
    file: 'arkansas-highway-sign.jpeg',
    alt: 'A “Welcome to Arkansas” sign beside a newly opened stretch of highway',
    width: 1040,
    height: 692,
    /* The sign is upper-right; a centre crop to 520×220 would cut it in half. */
    focus: '62% 38%',
  },
  /**
   * Commitment 05, "Give residents a voice". Supplied 2026-09-02.
   *
   * Residents and officials around a table in a meeting room, with county
   * district maps on the wall behind them. It is the one photograph on the site
   * that shows the thing its card is about — people being heard in a room where
   * decisions get made — rather than a place the decision is about.
   *
   * Provenance is better than commitment 03's but not confirmed: the filename it
   * arrived under is a Facebook CDN name, so it was most likely saved from the
   * campaign's own page, which the campaign would own. Worth one line of
   * confirmation before launch, not a blocker.
   *
   * ⚠ Portrait, 762×1040, shown in a 520×220 band — the crop keeps about a fifth
   * of the frame's height. `focus` holds it on the faces around the table; a
   * centre crop lands on the tabletop.
   */
  residentsMeeting: {
    file: 'residents-meeting.jpeg',
    alt: 'Residents and officials talking around a table at a public meeting',
    width: 762,
    height: 1040,
    focus: '50% 40%',
  },
  /** Commitment 01, "Protect natural areas" — see ART in platform.ts. */
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
  /**
   * The 2026 circular logo. Replaced the square green→blue lockup when the
   * campaign sent its new artwork on 2026-08-27, and became the HEADER MARK on
   * 2026-09-02 as well — it is now the site's identity everywhere: the header on
   * every page and width, the donate page, and the last commitment card.
   *
   * Cropped here from the supplied file, which set the circle on a white page
   * with a decorative dotted rule beneath it. The rule is not part of the mark,
   * and a white square would show as a box on every tinted surface this sits
   * on, so the crop is tight to the circle and the surround is transparent.
   *
   * That transparency is why it won the header. A wide painted sign cropped from
   * the campaign's roadside banner held that slot for part of 2026-09-02 and came
   * off again: opaque artwork in that corner needs a rounded edge and a shadow to
   * stop it looking unbounded on a pale page, and once it has both it reads as a
   * picture stuck to the page rather than as the site's mark. A circle has no
   * edges to bound. `assets/nav-banner-2026.png` is kept as a source in case a
   * wide lockup is ever wanted; nothing builds a derivative from it.
   */
  logoCircle: {
    file: 'logo-circle-2026.png',
    alt: 'Nancy Orum for Bella Vista City Council, Ward 2 — vote November 3rd',
    width: 480,
    height: 480,
  },
  /**
   * The 2026 yard sign, and the footer mark, are the same painting.
   *
   * Two records rather than one because the alt text is not the same job: in
   * the footer the sign IS the campaign's identifying mark, and on the involved
   * form it is a picture of the physical object being offered. Both point at
   * one derivative, so the artwork is downloaded once and cached for the other.
   */
  footerSign: {
    file: 'yard-sign-2026.jpeg',
    alt: 'Nancy Orum — City Council, Ward 2 — Bella Vista, Arkansas',
    width: 640,
    height: 426,
  },
  yardSign: {
    file: 'yard-sign-2026.jpeg',
    alt: 'A Nancy Orum for City Council yard sign',
    width: 640,
    height: 426,
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
