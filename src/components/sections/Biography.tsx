import { BIO_SECTION } from '../../content/about'
import { BIO_CREDO, BIO_SIGNOFF, FULL_BIO, PULLQUOTE_PROPOSAL } from '../../content/bio'

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
            <p key={paragraph.id}>{paragraph.text}</p>
          ))}
        </div>
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
