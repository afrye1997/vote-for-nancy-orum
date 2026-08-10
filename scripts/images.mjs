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
 * The originals are camera files and print masters — 48 MB across twelve
 * files, with two 7200px yard-sign renders displayed at 250 and 280 CSS pixels.
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
 * JPEG only where the original has no alpha channel. about-arkansas, the two
 * nav lockups, logo-lockup and the ward map are all transparent and stay PNG;
 * flattening them would put a white box around the artwork.
 */
const TARGETS = {
  'nav-logo.png': { px: 420 },
  'nav-logo-navy.png': { px: 420 },
  'about-arkansas.png': { px: 1200 },
  'logo-lockup.png': { px: 480 },
  'ward-map-2022.png': { px: 1280 },
  'footer-sign.png': { px: 560, jpeg: true },
  'yard-sign-3x6.png': { px: 640, jpeg: true },
  'tanyard-creek-falls.png': { px: 1040, jpeg: true },
  'hero-arms-crossed.jpeg': { px: 1800 },
  'community-event.jpeg': { px: 1800 },
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
 * Only one of the twelve is affected today, but the next photo off someone's
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

for (const [file, target] of Object.entries(TARGETS)) {
  const from = join(SRC, file)
  const fallbackName = target.jpeg ? file.replace(/\.png$/, '.jpeg') : file
  const to = join(OUT, fallbackName)
  const avifName = fallbackName.replace(/\.(png|jpeg)$/, '.avif')

  const orientation = exifOrientation(from)
  const resize = [...normalizeArgs(orientation), '-Z', String(target.px)]

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

console.log('  dimensions for src/content/images.ts:')
for (const d of declared) console.log(`    ${d.file.padEnd(28)} ${d.width} × ${d.height}`)
console.log('')
