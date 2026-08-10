import { STRENGTHS, STRENGTHS_EYEBROW } from '../../content/about'

/** "What I bring to the table" — four cards on a tinted band. */
export function Strengths() {
  return (
    <section className="section section--tinted">
      <div className="container">
        <h2 className="eyebrow">{STRENGTHS_EYEBROW}</h2>
        <ul className="strength-grid">
          {STRENGTHS.map((strength) => (
            <li className="card strength" key={strength.id}>
              <h3 className="strength__title">{strength.title}</h3>
              <p className="strength__body">{strength.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
