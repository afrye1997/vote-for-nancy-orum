import { STRENGTHS, STRENGTHS_EYEBROW } from '../../content/about'

/**
 * "What I bring to the table" — four cards on a tinted band.
 *
 * The `strengths` class scopes the section's type scale, which sections.css
 * sets 10% larger twice over. Without it the eyebrow bump would reach all
 * eleven components that use `.eyebrow`.
 */
export function Strengths() {
  return (
    <section className="section section--tinted strengths">
      <div className="container">
        <h2 className="eyebrow reveal">{STRENGTHS_EYEBROW}</h2>
        <ul className="strength-grid">
          {STRENGTHS.map((strength) => (
            <li className="card strength reveal" key={strength.id}>
              <h3 className="strength__title">{strength.title}</h3>
              <p className="strength__body">{strength.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
