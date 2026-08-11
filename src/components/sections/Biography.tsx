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
        <p className="signoff">
          <span className="signoff__refrain">{BIO_SIGNOFF.refrain}</span>
          <br />
          {BIO_SIGNOFF.name} · {BIO_SIGNOFF.title}, {BIO_SIGNOFF.seat}
        </p>
      </div>
    </section>
  )
}
