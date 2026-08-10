/**
 * Contrast audit.
 *
 * ENGINEERING.md §6: "Compute the ratio. Do not reason about it." A scrimmed
 * gradient was once rejected on this project as covering up a contrast problem;
 * when actually measured it was at 8.13:1, and the rejection cost a rebuild.
 *
 * Run with `npm run contrast`. Exits non-zero if any pair fails, so it can be
 * wired into a gate later.
 *
 * Text over a photograph is measured against its WORST CASE — the scrim colour
 * composited over pure white, i.e. what you get where the photograph is
 * brightest. Anything darker in the picture only helps.
 *
 * ⚠ A CORRECTION, AND THE LESSON IN IT
 * The first version of this file measured each gradient's densest STOP. That
 * passed, and the hero was still unreadable on screen, because the text panel
 * did not sit on the densest stop — it started at 53% of the width, inside the
 * ramp, over roughly 0.53 alpha rather than the 0.86 being measured.
 *
 * Measuring the right number is as important as measuring at all. Every alpha
 * below is now the LIGHTEST the scrim reaches anywhere its text actually sits,
 * and the gradients in tokens.css were adjusted so that value is reached before
 * the text begins. If you move a text panel, re-check which stop it lands on.
 */

const T = {
  green700: '#2E8312',
  green600: '#3DA21C',
  green300: '#9BD97D',
  green100: '#E7F5DC',
  lime300: '#A9E284',
  blue700: '#0A3EA7',
  blue600: '#1155D6',
  blue100: '#E3EDFC',
  navy900: '#12235B',
  navy700: '#25397F',
  slate700: '#3C4C74',
  slate600: '#56688A',
  slate400: '#9DAECB',
  frost50: '#F6F9FD',
  frost100: '#ECF2FA',
  frost200: '#DCE6F2',
  white: '#FFFFFF',
  ctaBand: '#3D54B0',
  eyebrow: '#2C7E11',
  slate500: '#687386',
  borderControl: '#8391AA',
  formError: '#A3341C',
}

function rgb(hex) {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** Composite `over` at `alpha` on top of `under`. */
function blend(over, under, alpha) {
  const a = rgb(over)
  const b = rgb(under)
  const mix = a.map((c, i) => Math.round(c * alpha + b[i] * (1 - alpha)))
  return '#' + mix.map((c) => c.toString(16).padStart(2, '0')).join('')
}

function luminance(hex) {
  const [r, g, b] = rgb(hex).map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function ratio(fg, bg) {
  const a = luminance(fg)
  const b = luminance(bg)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

/**
 * Lightest alpha each scrim reaches under its own text, over the brightest
 * possible photograph. See the correction note above.
 */
const scrimHero = blend(T.navy900, T.white, 0.88)
const scrimHeroNarrow = blend(T.navy900, T.white, 0.78)
const scrimHeader = blend(T.navy900, T.white, 0.7)
const scrimBand = blend(T.navy900, T.white, 0.78)
const scrimPageHero = blend(T.navy900, T.white, 0.82)

/** [what, foreground, background, required] — 4.5 body, 3.0 large text and UI. */
const PAIRS = [
  ['body text', T.navy900, T.frost50, 4.5],
  ['lede on page', T.slate700, T.frost50, 4.5],
  ['lede on card', T.slate700, T.white, 4.5],
  ['lede on tint', T.slate700, T.frost100, 4.5],
  ['eyebrow on page', T.eyebrow, T.frost50, 4.5],
  ['eyebrow on tint', T.eyebrow, T.frost100, 4.5],
  ['muted note on page', T.slate600, T.frost50, 4.5],
  ['muted note on card', T.slate600, T.white, 4.5],
  ['stat source link', T.slate600, T.frost50, 4.5],
  ['rail index label', T.slate600, T.white, 4.5],
  ['rail index number', T.slate500, T.white, 4.5],
  ['link on page', T.blue600, T.frost50, 4.5],
  ['pull quote on tint', T.blue600, T.frost100, 4.5],
  ['stat figure (large)', T.blue600, T.frost50, 3.0],
  ['ballot answer title', T.eyebrow, T.green100, 4.5],
  ['accent button', T.navy900, T.green600, 4.5],
  ['accent button hover', T.white, T.green700, 4.5],
  ['primary button', T.white, T.blue600, 4.5],
  ['primary button hover', T.white, T.blue700, 4.5],
  ['secondary button label', T.blue600, T.frost50, 4.5],
  ['secondary button hover', T.blue600, T.blue100, 4.5],
  ['inverse button label', T.blue600, T.frost50, 4.5],
  ['CTA band title', T.white, T.ctaBand, 4.5],
  ['CTA band subtitle', T.frost100, T.ctaBand, 4.5],
  ['footer body', T.frost200, T.navy700, 4.5],
  ['footer link', T.frost100, T.navy700, 4.5],
  ['footer at-large notice', T.green300, T.navy700, 4.5],
  ['hero headline over scrim', T.white, scrimHero, 4.5],
  ['hero lede over scrim', T.frost100, scrimHero, 4.5],
  ['hero eyebrow over scrim', T.lime300, scrimHero, 4.5],
  ['hero headline, narrow scrim', T.white, scrimHeroNarrow, 4.5],
  ['hero lede, narrow scrim', T.frost100, scrimHeroNarrow, 4.5],
  ['hero eyebrow, narrow scrim', T.lime300, scrimHeroNarrow, 4.5],
  ['nav link over header scrim', T.frost100, scrimHeader, 4.5],
  ['nav current over header scrim', T.white, scrimHeader, 4.5],
  ['about band line over scrim', T.white, scrimBand, 4.5],
  ['about band eyebrow over scrim', T.lime300, scrimBand, 4.5],
  ['involved hero title over scrim', T.white, scrimPageHero, 4.5],
  ['involved hero eyebrow over scrim', T.lime300, scrimPageHero, 4.5],
  ['focus ring on page', T.navy900, T.frost50, 3.0],
  ['focus ring on card', T.navy900, T.white, 3.0],
  ['focus ring over scrim', T.white, scrimHero, 3.0],
  ['input border', T.borderControl, T.white, 3.0],
  ['form error on card', T.formError, T.white, 4.5],
  ['card border', T.frost200, T.white, 1.0],
]

let failed = 0
console.log('\n  ratio  need  result  pair')
console.log('  ─────  ────  ──────  ' + '─'.repeat(36))
for (const [name, fg, bg, need] of PAIRS) {
  const r = ratio(fg, bg)
  const ok = r >= need
  if (!ok) failed += 1
  console.log(
    `  ${r.toFixed(2).padStart(5)}  ${need.toFixed(1).padStart(4)}  ${(ok ? 'pass' : 'FAIL').padStart(6)}  ${name}`,
  )
}

console.log(`\n  worst-case scrims: hero ${scrimHero}, band ${scrimBand}, page hero ${scrimPageHero}`)
if (failed > 0) {
  console.error(`\n  ${failed} pair(s) below threshold.\n`)
  process.exit(1)
}
console.log(`\n  all ${PAIRS.length} pairs pass.\n`)
