/**
 * Image preparation.
 *
 * Reads the design project's originals from `assets/` and writes web-sized
 * derivatives into `public/img/`. Run it once after copying new artwork in:
 *
 *   npm run images
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS EXISTS
 * ─────────────────────────────────────────────────────────────────────────────
 * The originals are camera files and print masters — tens of megabytes across
 * the files in TARGETS, including 7000px sign renders displayed at a few hundred
 * CSS pixels.
 * Shipped as-is the home page weighed 15 MB and the platform page 35 MB, which
 * misses ENGINEERING.md §5's LCP budget by more than an order of magnitude.
 *
 * Note that `public/` is copied to `dist/` wholesale, referenced or not, so
 * leaving the originals there ships them even if nothing points at one. That is
 * why the originals live outside it.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY sips, AND WHY THIS IS NOT PART OF `npm run build`
 * ─────────────────────────────────────────────────────────────────────────────
 * `sips` is macOS-only. Putting it in the build would make the build refuse to
 * run anywhere else, and "the host is not a dependency" is the rule this
 * project builds around. So the derivatives are generated once, committed, and
 * the build just copies them — which also keeps the build fast and
 * deterministic.
 *
 * The alternative was a dependency on sharp. One `npm run images` a month does
 * not justify 30 MB of native binaries in the tree (§4).
 *
 * TARGETS are twice each image's largest CSS display width, so the artwork is
 * sharp on a 2× display and nothing is downloaded that cannot be seen. Where an
 * image is full-bleed, 1800 is the cap: those sit under a heavy navy scrim, and
 * detail lost there is detail nobody can see.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TWO FILES PER IMAGE
 * ─────────────────────────────────────────────────────────────────────────────
 * Each target is written twice: an AVIF, and a PNG or JPEG fallback. Components
 * render both through a <picture>, so a visitor downloads exactly one.
 *
 * AVIF is worth the second file because sips' JPEG and PNG encoders are not
 * good. Measured on this set: the About portrait is 1367 kB as PNG and 132 kB
 * as AVIF, and it is the largest element on its page — the difference is most
 * of that page's LCP. The ward map goes 1116 → 152 kB, the hero 682 → 266 kB.
 * AVIF also keeps the alpha channel, so the masked artwork does not have to be
 * flattened onto a background colour to escape PNG.
 *
 * The fallback is not optional. AVIF is missing from Safari before 16.4, and a
 * campaign's audience is exactly the audience still running an old iPad.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const SRC = 'assets'
const OUT = 'public/img'

/**
 * file → { px: longest edge in the output, jpeg: convert to JPEG }
 *
 * JPEG only where the original has no alpha channel. about-arkansas,
 * logo-circle-2026 and the ward map are transparent and stay PNG; flattening
 * them would put a white box around the artwork.
 */
const TARGETS = {
  /**
   * The 2026 nav lockups, supplied 2026-09-02. Two cuts of one mark: white type
   * for the photographic pages, navy for the pale ones. Both stay PNG — they are
   * knockouts with real alpha, and flattening either would put a box around the
   * artwork on whichever surface it sits on.
   *
   * ⚠ Both were cropped to the SAME box before landing here, chosen as the union
   * of the two files' ink. That is what lets the header swap one for the other
   * without the logo's box changing size — see the note in images.ts.
   */
  'nav-logo-white-2026.png': { px: 440 },
  'nav-logo-navy-2026.png': { px: 440 },
  'about-arkansas.png': { px: 1200 },
  /**
   * The 2026 circular logo, supplied by the campaign on 2026-08-27. Stays PNG:
   * it is cropped to the circle with a transparent surround, and flattening it
   * would put a white square behind the artwork on every tinted background it
   * sits on. Replaced the green→blue `logo-lockup.png`.
   */
  'logo-circle-2026.png': { px: 480 },
  'ward-map-2022.png': { px: 1280 },
  /**
   * The 2026 watercolour yard sign, same supply date. One source feeds both the
   * footer mark and the yard-sign illustration on the involved form — they are
   * the same artwork at two sizes, so one 640px derivative serves both rather
   * than shipping the painting twice. Replaced `footer-sign.png` and
   * `yard-sign-3x6.png`, whose gradient artwork is no longer the brand.
   */
  'yard-sign-2026.png': { px: 640, jpeg: true },
  'tanyard-creek-falls.png': { px: 1040, jpeg: true },
  /*
   * Commitment 03's photograph, supplied 2026-09-02. Already web-sized at
   * 1500×999 when it arrived — see the rights note in images.ts — so 1040 is a
   * downscale rather than a derivative of a master.
   */
  'arkansas-highway-sign.jpeg': { px: 1040 },
  /*
   * Commitment 05's photograph, supplied 2026-09-02. Portrait, and cropped hard
   * to the card's 520×220 band — see the focus point in images.ts.
   */
  'residents-meeting.jpeg': { px: 1040 },
  /* Commitment 06's photograph, supplied 2026-09-02. */
  'trail-riders.jpeg': { px: 1040 },
  /* Commitments 02 and 04, supplied 2026-09-02. */
  /* 980, not 1040: this one arrived only 1000px wide and the target must sit
     below the source or the AVIF will not decode — see the guard below. */
  'lake-paddleboarding.jpeg': { px: 980 },
  /*
   * 1036, not 1040, and the four pixels matter. At 1040 this source lands on
   * 1040x617 and sips writes an AVIF that CHROME WILL NOT DECODE — see the
   * second failure mode in the note above the resample guard. 1036, 1000, 960,
   * 900 and 1200 all decode; only 1040 fails. Do not "tidy" this to match its
   * neighbours.
   */
  'bvpd-badge.jpeg': { px: 1036 },
  'hero-arms-crossed.jpeg': { px: 1800 },
  'community-event.jpeg': { px: 1800 },
  'campaign-booth.jpeg': { px: 1040 },
  'family-square.jpeg': { px: 1800 },
  'nancy-orum-headshot.jpeg': { px: 1040 },
}

const JPEG_QUALITY = '72'
const AVIF_QUALITY = '60'

/**
 * EXIF orientation, straight out of the first IFD.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS IS HERE
 * ─────────────────────────────────────────────────────────────────────────────
 * `family-square.jpeg` is stored upside down with an EXIF tag asking the viewer
 * to rotate it 180°. Browsers honour that, so the original looks right
 * everywhere you inspect it. `sips` resamples the stored pixels and the tag
 * does not survive, so the derivative shipped upside down — and it looked fine
 * in `assets/`, in Preview, and in the design project the whole time.
 *
 * Only one of the thirteen is affected today, but the next photo off someone's
 * phone is a coin flip, so all eight orientations are handled rather than the
 * one case that bit us.
 */
function exifOrientation(path) {
  const b = readFileSync(path)
  const marker = b.indexOf(Buffer.from('Exif\0\0'))
  if (marker < 0) return 1
  const tiff = marker + 6
  const little = b.toString('ascii', tiff, tiff + 2) === 'II'
  const u16 = (o) => (little ? b.readUInt16LE(o) : b.readUInt16BE(o))
  const u32 = (o) => (little ? b.readUInt32LE(o) : b.readUInt32BE(o))
  const ifd = tiff + u32(tiff + 4)
  const count = u16(ifd)
  for (let i = 0; i < count; i += 1) {
    const entry = ifd + 2 + i * 12
    if (u16(entry) === 0x0112) return u16(entry + 8)
  }
  return 1
}

/** sips arguments that bake an EXIF orientation into the pixels. */
function normalizeArgs(orientation) {
  switch (orientation) {
    case 2:
      return ['--flip', 'horizontal']
    case 3:
      return ['--rotate', '180']
    case 4:
      return ['--flip', 'vertical']
    case 5:
      return ['--flip', 'horizontal', '--rotate', '270']
    case 6:
      return ['--rotate', '90']
    case 7:
      return ['--flip', 'horizontal', '--rotate', '90']
    case 8:
      return ['--rotate', '270']
    default:
      return []
  }
}

function dimensions(path) {
  const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', path], {
    encoding: 'utf8',
  })
  const width = Number(/pixelWidth:\s*(\d+)/.exec(out)?.[1])
  const height = Number(/pixelHeight:\s*(\d+)/.exec(out)?.[1])
  return { width, height }
}

mkdirSync(OUT, { recursive: true })

const present = new Set(readdirSync(SRC))
const missing = Object.keys(TARGETS).filter((f) => !present.has(f))
if (missing.length) {
  console.error(`\nMissing from ${SRC}/:\n${missing.map((f) => `  ${f}`).join('\n')}\n`)
  console.error('See public/img/README.md for where these come from.\n')
  process.exit(1)
}

console.log('\n  source            fallback         avif      dimensions   file')
console.log('  ' + '─'.repeat(76))

let before = 0
let afterFallback = 0
let afterAvif = 0
const declared = []
const rotated = []
const notResampled = []

for (const [file, target] of Object.entries(TARGETS)) {
  const from = join(SRC, file)
  const fallbackName = target.jpeg ? file.replace(/\.png$/, '.jpeg') : file
  const to = join(OUT, fallbackName)
  const avifName = fallbackName.replace(/\.(png|jpeg)$/, '.avif')

  const orientation = exifOrientation(from)
  const resize = [...normalizeArgs(orientation), '-Z', String(target.px)]

  /*
   * ⚠ THE TARGET MUST BE SMALLER THAN THE SOURCE. Not a size preference — a
   * correctness one, and it fails silently.
   *
   * `sips -Z` only ever shrinks. Hand it a target at or above the source's
   * longest edge and it does not resample at all, and the AVIF it then writes
   * from that untouched file DOES NOT DECODE. Chrome takes the AVIF (its type is
   * supported, so <picture> never reaches the JPEG), fails to decode it, and
   * paints nothing. The card renders with a blank hole where the photograph is,
   * every gate passes, and both files are valid on disk.
   *
   * Found on 2026-09-02 with a 1024px source targeted at 1024. Dropping the
   * target to 1000 forced a resample and the AVIF decoded.
   *
   * ─────────────────────────────────────────────────────────────────────────
   * ⚠ AND A SECOND FAILURE MODE THIS CHECK DOES NOT CATCH
   * ─────────────────────────────────────────────────────────────────────────
   * sips also writes undecodable AVIFs from some perfectly ordinary
   * source/target combinations, with no pattern anyone has pinned down. The
   * BVPD badge at 1040 (landing on 1040x617) produces one; at 1036, 1000, 960,
   * 900 and 1200 it is fine, and other images at 1040 are fine. Neighbouring
   * sizes work, so it is not the odd height.
   *
   * There is no build-time test for it. `sips` DECODES ITS OWN BAD OUTPUT
   * HAPPILY — it round-trips the broken file back to a valid PNG — so the only
   * oracle is a browser, and making this script depend on Chrome is worse than
   * the bug.
   *
   * THE SYMPTOM, so the next person recognises it in one look: a card renders
   * with a blank hole where the photograph goes. Both files exist, both are
   * valid to `file` and to sips, both serve 200, every gate passes. Open the
   * .avif on its own in a browser — a blank grey page means this. Nudge the
   * target by a few pixels and it goes away.
   */
  const source = dimensions(from)
  if (Math.max(source.width, source.height) <= target.px) {
    notResampled.push({ file, target: target.px, longest: Math.max(source.width, source.height) })
  }

  const fallbackArgs = [...resize]
  if (target.jpeg) fallbackArgs.push('-s', 'format', 'jpeg', '-s', 'formatOptions', JPEG_QUALITY)
  execFileSync('sips', [...fallbackArgs, from, '--out', to], { stdio: 'ignore' })

  execFileSync(
    'sips',
    [...resize, '-s', 'format', 'avif', '-s', 'formatOptions', AVIF_QUALITY, from, '--out', join(OUT, avifName)],
    { stdio: 'ignore' },
  )
  if (orientation !== 1) rotated.push(`${file} (EXIF orientation ${orientation})`)

  const dst = dimensions(to)
  const fromKb = statSync(from).size / 1024
  const toKb = statSync(to).size / 1024
  const avifKb = statSync(join(OUT, avifName)).size / 1024
  before += fromKb
  afterFallback += toKb
  afterAvif += avifKb
  declared.push({ file: fallbackName, ...dst })

  console.log(
    `  ${String(Math.round(fromKb)).padStart(6)} kB` +
      `   ${String(Math.round(toKb)).padStart(6)} kB` +
      `   ${String(Math.round(avifKb)).padStart(6)} kB` +
      `   ${`${dst.width}×${dst.height}`.padEnd(12)} ${fallbackName}`,
  )
}

console.log(
  `\n  ${(before / 1024).toFixed(1)} MB of originals → ` +
    `${(afterAvif / 1024).toFixed(1)} MB served to a modern browser, ` +
    `${(afterFallback / 1024).toFixed(1)} MB to an old one\n`,
)

/**
 * src/content/images.ts declares each file's dimensions so every <img> can
 * carry width and height. Those numbers have to match what was just written,
 * or the reserved box is the wrong shape and the layout shifts anyway.
 * scripts/prerender.mjs checks this on every build; this is the list to paste
 * in when a target above changes.
 */
if (rotated.length) {
  console.log('  orientation baked in:')
  for (const r of rotated) console.log('    ' + r)
  console.log('')
}

if (notResampled.length) {
  console.error('\n  ⚠ TARGET AT OR ABOVE SOURCE SIZE — the AVIF will not decode:\n')
  for (const n of notResampled) {
    console.error(`    ${n.file}: source is ${n.longest}px, target is ${n.target}px`)
  }
  console.error("\n  `sips -Z` only shrinks. At or above the source size it does not resample,")
  console.error('  and the AVIF written from the untouched file does not decode — the browser')
  console.error('  takes it over the JPEG and paints nothing. Lower the target below the')
  console.error("  source's longest edge, or supply a larger original.\n")
  process.exit(1)
}

console.log('  dimensions for src/content/images.ts:')
for (const d of declared) console.log(`    ${d.file.padEnd(28)} ${d.width} × ${d.height}`)
console.log('')
