/**
 * Static site generator.
 *
 * Renders each page to HTML at build time and writes real files. No client
 * router and no SPA fallback — every URL is a complete document, so crawlers
 * and link-preview bots get the content without running anything.
 *
 * Runs after `vite build` (client) and `vite build --ssr` (the renderer).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HYDRATION
 * ─────────────────────────────────────────────────────────────────────────────
 * Each document carries three things the browser needs to take over the markup
 * rather than rebuild it: the rendered body inside `#root`, the props that
 * produced it in a `page-data` JSON script, and the hashed client bundle.
 *
 * The props matter. The client re-renders the same components with the same
 * inputs; if what it reads here differs from what the server rendered from,
 * React discards the server HTML and rebuilds the page, silently undoing the
 * point of prerendering.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HEAD CONTENTS
 * ─────────────────────────────────────────────────────────────────────────────
 * The body comes from React; everything inside <head> is built here, because
 * the render produces a fragment with no document for React 19's metadata
 * hoisting to hoist into.
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'

const DIST = 'dist'
const BASE = process.env.SITE_BASE ?? '/'
const WEB3FORMS_KEY = process.env.WEB3FORMS_KEY ?? null
/** Absolute origin, e.g. https://nancyorum.com — required for social previews. */
const ORIGIN = process.env.SITE_ORIGIN ?? null

/**
 * Expected exports from the SSR bundle:
 *   PAGES: Array<{ id, out, title, description, path, noindex }>
 *   renderPage(id, { base, web3formsKey, origin }): string
 *   renderNotFound({ base, web3formsKey, origin }): string
 */
const { PAGES, renderPage, renderNotFound } = await import('../dist-ssr/entry-server.js')

const renderOpts = { base: BASE, web3formsKey: WEB3FORMS_KEY, origin: ORIGIN }

/**
 * Fonts, from Google Fonts, as the design system specifies.
 *
 * Written as <link> rather than the design system's `@import`, which would sit
 * inside a stylesheet the browser has to download and parse before it can even
 * discover the font request — two serial round trips to a third party before
 * the first paint. Preconnect opens the connections while the CSS is still in
 * flight, and `display=swap` renders in the fallback rather than blocking.
 *
 * Self-hosting these would remove the third party altogether and is the right
 * end state; it needs the font binaries, which we do not have.
 */
const FONT_LINKS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Libre+Caslon+Display&family=Figtree:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap">`

/** Find an emitted asset by extension. At most one of each is expected. */
async function findAsset(ext) {
  const assets = join(DIST, 'assets')
  if (!existsSync(assets)) return null
  const hits = (await readdir(assets)).filter((f) => f.endsWith(ext))
  if (hits.length === 0) return null
  if (hits.length > 1) {
    throw new Error(`expected at most 1 ${ext} file in dist/assets, found ${hits.length}`)
  }
  return `${BASE}assets/${hits[0]}`
}

function escapeHtml(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  )
}

/**
 * Serialise props for the client. `</script>` inside a JSON string would close
 * the tag early and drop the rest of the document into the page as text, so the
 * two characters that can start a tag are escaped.
 */
function jsonScript(id, value) {
  const json = JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e')
  return `<script id="${id}" type="application/json">${json}</script>`
}

function document({ title, description, body, props, cssHref, jsHref, ogImage, canonical, noindex }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta name="theme-color" content="#12235B">${noindex ? '\n<meta name="robots" content="noindex">' : ''}${
    canonical ? `\n<link rel="canonical" href="${canonical}">` : ''
  }
<meta property="og:type" content="website">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta name="twitter:card" content="summary_large_image">${
    ogImage
      ? `
<meta property="og:image" content="${ogImage}">
<meta name="twitter:image" content="${ogImage}">`
      : `
<!-- og:image omitted until an asset exists. A tag pointing at a missing file
     is worse than no tag. Facebook and Twitter also require an ABSOLUTE url,
     so this needs SITE_ORIGIN set. -->`
  }
${FONT_LINKS}
${cssHref ? `<link rel="stylesheet" href="${cssHref}">` : '<!-- no stylesheet emitted -->'}
</head>
<body>
<div id="root">${body}</div>
${jsonScript('page-data', props)}
${jsHref ? `<script type="module" src="${jsHref}"></script>` : '<!-- no client bundle emitted -->'}
</body>
</html>
`
}

const cssHref = await findAsset('.css')
const jsHref = await findAsset('.js')
const ogImage = ORIGIN ? `${ORIGIN}${BASE}img/og-card.jpg` : null
const written = []

for (const page of PAGES) {
  const { html: body, props } = renderPage(page.id, renderOpts)
  const html = document({
    title: page.title,
    description: page.description,
    body,
    props,
    cssHref,
    jsHref,
    ogImage,
    canonical: ORIGIN ? `${ORIGIN}${BASE}${page.path}` : null,
    noindex: page.noindex,
  })
  const target = join(DIST, page.out)
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, html, 'utf8')
  written.push({ path: page.out, kb: (Buffer.byteLength(html) / 1024).toFixed(1) })
}

/**
 * GitHub Pages serves 404.html for unknown paths. Without it, visitors get
 * GitHub's generic 404, which looks nothing like the campaign.
 */
const notFoundRender = renderNotFound(renderOpts)
const notFound = document({
  title: 'Page not found — Nancy Orum for Bella Vista City Council',
  description: 'That page does not exist.',
  cssHref,
  jsHref,
  ogImage: null,
  canonical: null,
  noindex: true,
  body: notFoundRender.html,
  props: notFoundRender.props,
})
await writeFile(join(DIST, '404.html'), notFound, 'utf8')
written.push({ path: '404.html', kb: (Buffer.byteLength(notFound) / 1024).toFixed(1) })

/** Jekyll would otherwise ignore files and folders beginning with an underscore. */
await writeFile(join(DIST, '.nojekyll'), '', 'utf8')

const stale = join(DIST, 'index.html')
if (existsSync(stale)) {
  const contents = await readFile(stale, 'utf8')
  /*
   * Every page now contains `id="root"`, so that can no longer be the tell.
   * The Vite shell is identified by the unhashed source path in its script tag,
   * which only survives if this file never overwrote the shell.
   */
  if (contents.includes('/src/entry-client')) {
    throw new Error('dist/index.html is still the Vite shell — prerender did not overwrite it')
  }
}

/**
 * The forbidden-strings scan. See ENGINEERING.md §6.
 *
 * A rule that lives only in a comment gets re-broken by the next person who
 * reads a design mockup instead of src/content/. This is the mechanism that
 * actually prevents it.
 *
 * CONFIRM THIS FAILS on a deliberate bad value before trusting it.
 */
const FORBIDDEN = [
  // Statistics that failed fact-checking — see src/content/growth.ts
  ['30,102', 'wrong 2020 census count; the figure is 30,104'],
  ['33,274', 'superseded population estimate; current is 34,518'],
  ['fifteen times', 'fabricated comparison — no 2013 permit data exists'],
  // Fictional contact details
  ['555-1234', 'fictional phone number'],
  ['hello@nancyorum.com', 'undeliverable — domain unregistered'],
  // At-large violations — every Bella Vista voter votes in this race
  ['Ward 2 residents', 'implies ward-restricted voting'],
  ['if you live in Ward 2', 'implies ward-restricted voting'],
  // From the design mockup's ward-lookup widget (services/wardCheck.js). Both
  // sentences are false: Bella Vista elects at large, so the race is on every
  // city voter's ballot. Listed in both apostrophe forms because the mockup
  // uses a straight quote and our content modules use a typographic one.
  ["won't be on your ballot", 'at-large violation — tells eligible voters not to bother'],
  ['won’t be on your ballot', 'at-large violation — tells eligible voters not to bother'],
  ['outside Ward 2', 'implies ward-restricted voting'],
  ['Am I in Ward 2', 'frames eligibility as a ward question; it is a city-wide race'],
  // Unresolved placeholders and dead links
  ['INSERT HERE', 'unresolved legal text'],
  ['href="#"', 'dead link'],
]

const failures = []
/** Every image the pages reference, so a missing file cannot ship unnoticed. */
const referenced = new Set()
/** The width/height each <img> actually claims, checked against the real file. */
const declaredSizes = new Map()

/**
 * Intrinsic size straight out of the file header — PNG's IHDR chunk, or the
 * first JPEG frame marker. Thirty lines, versus a dependency that reads every
 * format nobody here uses.
 *
 * AVIF is not parsed: its dimensions live inside an ISO-BMFF box tree, and the
 * AVIF is generated from the same source at the same target as the fallback we
 * do check, so verifying one verifies both.
 */
function intrinsicSize(buf) {
  if (buf.length > 24 && buf.toString('ascii', 1, 4) === 'PNG') {
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) }
  }
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2
    while (i < buf.length - 9) {
      if (buf[i] !== 0xff) {
        i += 1
        continue
      }
      const marker = buf[i + 1]
      // SOF0–SOF15, excluding DHT (c4), JPG (c8) and DAC (cc).
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { w: buf.readUInt16BE(i + 7), h: buf.readUInt16BE(i + 5) }
      }
      i += 2 + buf.readUInt16BE(i + 2)
    }
  }
  return null
}

for (const { path } of written) {
  const html = await readFile(join(DIST, path), 'utf8')
  for (const [needle, why] of FORBIDDEN) {
    if (html.includes(needle)) failures.push(`  ${path}: "${needle}" — ${why}`)
  }
  for (const [, src] of html.matchAll(/(?:src|srcSet|srcset)="([^"]*\/img\/[^"]+)"/g)) {
    referenced.add(src.slice(BASE.length))
  }
  for (const [, tag] of html.matchAll(/<img\b([^>]*)>/g)) {
    const src = /src="([^"]*\/img\/[^"]+)"/.exec(tag)?.[1]
    const w = Number(/\bwidth="(\d+)"/.exec(tag)?.[1])
    const h = Number(/\bheight="(\d+)"/.exec(tag)?.[1])
    if (src) declaredSizes.set(src.slice(BASE.length), { w, h, page: path })
  }
}

/**
 * The photographs are copied into public/img/ by hand — see the README there.
 * A missing one renders as a broken image, which is the sort of thing that gets
 * noticed by a voter rather than by us.
 *
 * A build without SITE_ORIGIN is somebody looking at their work, so this only
 * warns. A build with SITE_ORIGIN is aimed at a real domain, and fails.
 */
const missingImages = [...referenced].filter((rel) => !existsSync(join(DIST, rel))).sort()

console.log('\nPrerendered:')
for (const w of written) console.log(`  ${w.path.padEnd(20)} ${w.kb.padStart(6)} kB`)
console.log(`\n  base:      ${BASE}`)
console.log(`  stylesheet: ${cssHref ?? 'none emitted'}`)
console.log(`  client js:  ${jsHref ?? 'NONE — pages will not hydrate'}`)
console.log(`  og:image:  ${ogImage ?? 'not set — needs SITE_ORIGIN'}`)
console.log(`  web3forms: ${WEB3FORMS_KEY ? 'configured' : 'NOT CONFIGURED — form will not submit'}`)

if (missingImages.length) {
  const list = missingImages.map((f) => `  ${f}`).join('\n')
  if (ORIGIN) {
    console.error(`\nMISSING IMAGES (${missingImages.length}):\n${list}\n`)
    failures.push('  images above are referenced but absent from public/img/')
  } else {
    console.warn(
      `\n  ⚠ ${missingImages.length} referenced image(s) are not in public/img/ yet:\n${list}\n` +
        '    See public/img/README.md. This becomes a build failure once SITE_ORIGIN is set.\n',
    )
  }
} else {
  console.log(`  images:    all ${referenced.size} present (AVIF + fallback)`)
}

/**
 * A width/height attribute that disagrees with the file reserves the wrong
 * shape, which produces exactly the layout shift the attributes exist to
 * prevent — and it does it silently, because the picture still appears.
 *
 * This is what keeps src/content/images.ts honest after someone retargets a
 * size in scripts/images.mjs and forgets to paste the new numbers across.
 */
const wrongSize = []
for (const [rel, declared] of declaredSizes) {
  const file = join(DIST, rel)
  if (!existsSync(file)) continue
  const actual = intrinsicSize(await readFile(file))
  if (!actual) continue
  if (actual.w !== declared.w || actual.h !== declared.h) {
    wrongSize.push(
      `  ${rel}: markup says ${declared.w}×${declared.h}, file is ${actual.w}×${actual.h}` +
        ` (${declared.page})`,
    )
  }
}
if (wrongSize.length) {
  console.error(`\nIMAGE DIMENSIONS DISAGREE WITH THE FILES:\n${wrongSize.join('\n')}\n`)
  failures.push('  fix the width/height in src/content/images.ts — run `npm run images` to reprint them')
} else if (declaredSizes.size) {
  console.log(`  dimensions: all ${declaredSizes.size} match their files`)
}

if (failures.length) {
  console.error('\nBUILD OUTPUT FAILED ITS CHECKS:\n' + failures.join('\n') + '\n')
  process.exit(1)
}
console.log('  forbidden-strings scan: clean\n')
