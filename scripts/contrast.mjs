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
  navy900: '#0C1F5E',
  navy700: '#22397F',
  blue700: '#1B4288',
  blue600: '#2456A6',
  blue100: '#E4EBF9',
  gold700: '#C98A16',
  gold600: '#F0B63C',
  gold300: '#F7CE85',
  gold800: '#B8790E',
  gold100: '#FCEED4',
  pine700: '#276847',
  pine300: '#BBDDCC',
  pine100: '#EFF8F4',
  rose600: '#AE3448',
  rose500: '#F87888',
  rose300: '#F7AFBA',
  rose100: '#FDECEF',
  slate700: '#3B4B75',
  slate600: '#55678B',
  slate400: '#9CADCB',
  frost50: '#F7F9FD',
  frost100: '#ECF1FA',
  frost200: '#DCE5F2',
  white: '#FFFFFF',
  ctaBand: '#2F4C9B',
  eyebrow: '#AE3448', /* = --rose-600 */
  slate500: '#67728A',
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
 *
 * ⚠ THERE IS NO HEADER SCRIM. Two pairs here used to measure `nav link` and
 * `nav current` against a `scrimHeader` at 0.7 alpha, and both passed
 * comfortably — for a surface the site does not render. `.site-header::before`
 * was never defined in any stylesheet; the only rule mentioning it was a
 * `display: none` for the narrow bar, which has now gone too. The header sits
 * directly on the photograph, per the mockup, and that is the pair below.
 */
const scrimHero = blend(T.navy900, T.white, 0.88)
const scrimHeroNarrow = blend(T.navy900, T.white, 0.78)
const scrimBand = blend(T.navy900, T.white, 0.78)
const scrimPageHero = blend(T.navy900, T.white, 0.82)

/**
 * Pairs the site is KNOWN to fail, and has decided to ship anyway.
 *
 * They are measured and printed like everything else — the number is the point
 * — but they do not set the exit code, because a gate that is red on purpose
 * stops being read. Each one needs a matching row in HANDOFF.md under "Known
 * remaining gaps to 1:1"; if it is not written down there, it is not a known
 * gap, it is a bug.
 *
 * Do NOT clear one of these by inventing a background. That is exactly how the
 * header ended up being audited against a scrim it does not have.
 */
const GAP = 'known gap'

/**
 * [what, foreground, background, required, gap?] — 4.5 body, 3.0 large text
 * and UI. A fifth element marks the pair as an accepted failure, per GAP above.
 */
const PAIRS = [
  ['body text', T.navy900, T.frost50, 4.5],
  ['lede on page', T.slate700, T.frost50, 4.5],
  ['lede on card', T.slate700, T.white, 4.5],
  ['lede on tint', T.slate700, T.frost100, 4.5],
  ['eyebrow on page', T.eyebrow, T.frost50, 4.5],
  ['eyebrow on tint', T.eyebrow, T.frost100, 4.5],
  ['muted note on page', T.slate600, T.frost50, 4.5],
  ['muted note on card', T.slate600, T.white, 4.5],
  /* Her added sentences inside the statement's tinted advocacy card. */
  ['advocacy aside on tint', T.slate600, T.frost100, 4.5],
  ['stat source link', T.slate600, T.frost50, 4.5],
  ['rail index label', T.slate600, T.white, 4.5],
  ['rail index number', T.slate500, T.white, 4.5],
  ['link on page', T.blue600, T.frost50, 4.5],
  ['pull quote on tint', T.blue600, T.frost100, 4.5],
  ['stat figure (large)', T.blue600, T.frost50, 3.0],
  ['ballot answer title', T.eyebrow, T.gold100, 4.5],
  /* The chip-in card, which is pine where the ballot card is gold. */
  ['chip-in lead on pine', T.pine700, T.pine100, 4.5],
  ['chip-in body on pine', T.slate700, T.pine100, 4.5],
  ['chip-in note on pine', T.slate600, T.pine100, 4.5],
  ['selected text', T.navy900, T.rose100, 4.5],
  /* Her pink as a block colour, for anything that later sits on it. */
  ['navy on rose block', T.navy900, T.rose500, 4.5],
  ['chip-in card border', T.pine300, T.pine100, 1.0],
  ['accent button', T.navy900, T.gold600, 4.5],
  /* Navy stays on the hover too — see .btn--accent:hover in components.css. */
  ['accent button hover', T.navy900, T.gold700, 4.5],
  ['primary button', T.white, T.blue600, 4.5],
  ['primary button hover', T.white, T.blue700, 4.5],
  ['secondary button label', T.blue600, T.frost50, 4.5],
  ['secondary button hover', T.blue600, T.blue100, 4.5],
  ['inverse button label', T.blue600, T.frost50, 4.5],
  ['commitment card accent word', T.eyebrow, T.white, 4.5],
  /* The accented word in a page title. Large text, so 3.0 — About is 48px and
     Platform 36px, both well past the 24px threshold. The deep amber is the only
     gold that can do this job on a pale page; the block gold is 1.74:1 here. */
  ['title accent on page', T.gold800, T.frost50, 3.0],
  ['title accent on card', T.gold800, T.white, 3.0],
  ['commitment card, flipped: body', T.frost100, T.blue600, 4.5],
  ['commitment card, flipped: prompt', T.white, T.blue600, 4.5],
  ['CTA band title', T.white, T.ctaBand, 4.5],
  ['CTA band subtitle', T.frost100, T.ctaBand, 4.5],
  ['footer body', T.frost200, T.navy700, 4.5],
  ['footer link', T.frost100, T.navy700, 4.5],
  ['footer at-large notice', T.gold300, T.navy700, 4.5],
  ['hero headline over scrim', T.white, scrimHero, 4.5],
  ['hero headline accent over scrim', T.gold300, scrimHero, 4.5],
  ['hero headline accent, narrow scrim', T.gold300, scrimHeroNarrow, 4.5],
  ['hero lede over scrim', T.frost100, scrimHero, 4.5],
  ['hero eyebrow over scrim', T.gold300, scrimHero, 4.5],
  ['hero headline, narrow scrim', T.white, scrimHeroNarrow, 4.5],
  ['hero lede, narrow scrim', T.frost100, scrimHeroNarrow, 4.5],
  ['hero eyebrow, narrow scrim', T.gold300, scrimHeroNarrow, 4.5],
  /* The real surface: no scrim, so the worst case is the brightest pixel the
     photograph can reach. Both fail, and both are shipped — see GAP above and
     the "Header has no scrim, per the mockup" row in HANDOFF.md. The text
     shadow on `.site--dark .site-nav__link` is what makes this survivable in
     practice, and a shadow is not something this file can measure. */
  ['nav link over hero photo, no scrim', T.frost100, T.white, 4.5, GAP],
  ['nav current over hero photo, no scrim', T.white, T.white, 4.5, GAP],
  ['about band line over scrim', T.white, scrimBand, 4.5],
  ['about band eyebrow over scrim', T.gold300, scrimBand, 4.5],
  /* "matters", in the Get involved title, over that page's hero scrim. */
  ['title accent over page hero', T.gold300, scrimPageHero, 3.0],
  ['involved hero title over scrim', T.white, scrimPageHero, 4.5],
  ['involved hero eyebrow over scrim', T.gold300, scrimPageHero, 4.5],
  ['focus ring on page', T.navy900, T.frost50, 3.0],
  ['focus ring on card', T.navy900, T.white, 3.0],
  ['focus ring over scrim', T.white, scrimHero, 3.0],
  ['input border', T.borderControl, T.white, 3.0],
  ['form error on card', T.formError, T.white, 4.5],
  ['card border', T.frost200, T.white, 1.0],
]

let failed = 0
let gaps = 0
console.log('\n  ratio  need  result  pair')
console.log('  ─────  ────  ──────  ' + '─'.repeat(36))
for (const [name, fg, bg, need, gap] of PAIRS) {
  const r = ratio(fg, bg)
  const ok = r >= need
  let verdict = 'pass'
  if (!ok && gap === GAP) {
    verdict = 'GAP'
    gaps += 1
  } else if (!ok) {
    verdict = 'FAIL'
    failed += 1
  } else if (gap === GAP) {
    /* A gap that now passes is not good news to be quietly swallowed — either
       the design was fixed and the marker should go, or the wrong thing is
       being measured again. */
    verdict = 'FIXED?'
    failed += 1
  }
  console.log(
    `  ${r.toFixed(2).padStart(5)}  ${need.toFixed(1).padStart(4)}  ${verdict.padStart(6)}  ${name}`,
  )
}

console.log(`\n  worst-case scrims: hero ${scrimHero}, band ${scrimBand}, page hero ${scrimPageHero}`)
if (gaps > 0) {
  console.log(`  ${gaps} pair(s) marked GAP: failing on purpose, recorded in HANDOFF.md.`)
}
if (failed > 0) {
  console.error(`\n  ${failed} pair(s) below threshold, or marked GAP and no longer failing.\n`)
  process.exit(1)
}
console.log(`\n  ${PAIRS.length - gaps} of ${PAIRS.length} pairs pass; ${gaps} accepted gap(s).\n`)
