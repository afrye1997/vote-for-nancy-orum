import { LinkButton } from '../ui/Button'
import { WardLookup } from './WardLookup'
import { Photo } from '../ui/Photo'
import { BALLOT } from '../../content/involved'
import { IMAGES, imgSources } from '../../content/images'
import { AT_LARGE_NOTICE, KEY_DATES, OFFICIAL_LINKS } from '../../content/election'

/**
 * "Can I vote for Nancy?" — the block that replaces the mockup's ward lookup.
 *
 * The reasoning is written out at the top of content/involved.ts. In short: the
 * widget answered a question whose answer does not depend on the address typed
 * into it, and its wrong branch told eligible voters the race was not theirs.
 *
 * So the answer is stated. The map stays, because people are curious about
 * where the ward line runs, behind a `<details>` that needs no JavaScript. The
 * address field becomes a link to the state's voter lookup, which is the one
 * thing on this page that can tell a visitor something true about their own
 * registration.
 */
export function BallotCheck({ base }: { readonly base: string }) {
  return (
    <section className="section container" style={{ paddingBottom: 0 }}>
      <div className="ballot">
        <p className="eyebrow">{BALLOT.eyebrow}</p>
        <h2 className="ballot__title">{BALLOT.heading}</h2>
        <WardLookup />
        <div className="ballot__answer">
          <p className="ballot__answer-title">{BALLOT.answerTitle}</p>
          <p className="ballot__answer-body">{AT_LARGE_NOTICE.full}</p>
        </div>
        <details className="disclosure">
          <summary>{BALLOT.mapSummary}</summary>
          <div className="ward-map">
            <Photo {...imgSources(base, IMAGES.wardMap)} image={IMAGES.wardMap} />
          </div>
          <p className="note" style={{ marginTop: 8 }}>
            {BALLOT.mapCaption}
          </p>
        </details>
        <div className="ballot__actions">
          <LinkButton variant="secondary" href={OFFICIAL_LINKS.voterLookup} external>
            {BALLOT.lookupCta}
          </LinkButton>
          <LinkButton variant="accent" href="#involved-form">
            {BALLOT.involvedCta}
          </LinkButton>
        </div>
      </div>
      <div className="ballot">
        <h3 className="eyebrow" style={{ marginTop: 48 }}>
          {BALLOT.datesHeading}
        </h3>
      </div>
      <ul className="dates">
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
    </section>
  )
}
