import { Fragment } from 'react'
import { BIO_SECTION } from '../../content/about'
import { BIO_CREDO, BIO_SIGNOFF, FULL_BIO, PULLQUOTE_PROPOSAL } from '../../content/bio'

/**
 * The three words the campaign asked to have picked out of the biography:
 * family, growth, and Bella Vista. Across her eighteen paragraphs that is 5, 2
 * and 12 matches — roughly one a paragraph, which is emphasis rather than
 * highlighter.
 *
 * Longest alternative first. "Bella Vista" has to be offered before the single
 * words or an engine that took the shorter match could strand "Vista".
 *
 * Case-insensitive, and the ORIGINAL casing is what gets rendered — she writes
 * both "Family" and "family", and both should keep the capital she gave them.
 */
const EMPHASISE = /\b(Bella Vista|family|growth)\b/gi

/**
 * Wraps those words in <strong> at render time.
 *
 * Deliberately NOT done by editing the strings in bio.ts. Her paragraphs are
 * verbatim and that file forbids rewriting them; putting markup inside her
 * sentences would make every future reader of it wonder which parts are hers.
 * Emphasis is typography, so it lives in the component that sets the type.
 *
 * `split` with a capturing group returns [text, match, text, match, ...], so the
 * odd indices are exactly the words to wrap.
 */
function emphasise(text: string) {
  return text.split(EMPHASISE).map((part, i) =>
    i % 2 === 1 ? (
      <strong key={`${part}-${i}`}>{part}</strong>
    ) : (
      <Fragment key={`${part.slice(0, 12)}-${i}`}>{part}</Fragment>
    ),
  )
}

/**
 * Nancy's biography, verbatim.
 *
 * Every paragraph is exactly as she wrote it. Selecting which paragraphs appear
 * where is an editorial call; rewording them is not (see bio.ts).
 *
 * The pull quote is deliberately absent. `PULLQUOTE_PROPOSAL.approved` is false
 * — it is the largest type on the page and the line people would quote back at
 * her, so she picks it. The guard below means turning it on is one boolean in
 * bio.ts, not a hunt through components.
 *
 * ON THE PAGE SINCE 2026-09-02, and it took two years of asking to notice why it
 * was not. She sent these paragraphs on 2026-08-04. They were added to the About
 * page once, removed again because the mockup had no slot for them, and the
 * removal was never revisited — so NEEDED-FROM-CAMPAIGN.md went on asking her
 * for a "Why I am running" section that she had in fact already written, and she
 * eventually replied that she thought the site had one. She was right.
 */
export function Biography() {
  return (
    <section className="section container">
      <div className="bio reveal">
        <p className="eyebrow">{BIO_SECTION.eyebrow}</p>
        <h2 className="section__title">{BIO_SECTION.heading}</h2>
        {PULLQUOTE_PROPOSAL.approved ? (
          <blockquote className="credo">
            <p>{PULLQUOTE_PROPOSAL.text}</p>
          </blockquote>
        ) : null}
        <div className="bio__text">
          {FULL_BIO.map((paragraph) => (
            <p key={paragraph.id}>{emphasise(paragraph.text)}</p>
          ))}
        </div>
        {/*
          The credo is NOT emphasised, and that is a constraint rather than a
          preference. It is set in --font-display, and tokens.css records that
          the display stack has no real bold on any platform — Libre Caslon
          Display ships one weight. A <strong> in here would ask for a face that
          does not exist and get whichever synthetic the device improvises, which
          is the exact bug that made the growth figures look unbold on a phone.
          It is already the most emphasised type in the section anyway.
        */}
        <ul className="credo">
          {BIO_CREDO.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        {/*
          Her name and seat, without the refrain that used to sit above them.

          `BIO_SIGNOFF.refrain` — "Listening. Serving. Building Bella Vista
          Together." — is still in bio.ts because it is still how she closes her
          own bio, and that file is verbatim. It is not rendered because she
          retired the line on 2026-09-01 in favour of "Protect. Plan. Prosper."
          Choosing which of her sentences appear is the editorial call bio.ts
          expressly allows; rewording them is the thing it forbids.

          It would also have collided here: the band closing every page reads
          "Let's build them together", one screen below this.
        */}
        <p className="signoff">
          {BIO_SIGNOFF.name} · {BIO_SIGNOFF.title}, {BIO_SIGNOFF.seat}
        </p>
      </div>
    </section>
  )
}
