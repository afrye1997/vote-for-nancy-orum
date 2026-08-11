import { BALLOT } from '../../content/involved'
import { KEY_DATES } from '../../content/election'

/**
 * "Dates worth putting in your phone."
 *
 * Split out of BallotCheck so it can sit beside the form rather than under it
 * — see `.involved-split` in sections.css. It reads as its own thing anyway:
 * BallotCheck answers one question about eligibility, this is a calendar.
 *
 * Every date comes from election.ts, which is the only place they are written
 * down. Deadlines that are wrong on a campaign site are worse than absent, so
 * nothing here formats or derives a date — it prints what that file states.
 */
export function KeyDates() {
  return (
    <div className="key-dates">
      <h2 className="eyebrow reveal">{BALLOT.datesHeading}</h2>
      <ul className="dates reveal">
        {KEY_DATES.map((date) => (
          <li className="dates__item" key={date.iso}>
            <time className="dates__when" dateTime={date.iso}>
              {date.display}
            </time>
            <p className="dates__what">
              <span className="dates__label">{date.label}</span>
              {date.detail ? <> — {date.detail}</> : null}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
