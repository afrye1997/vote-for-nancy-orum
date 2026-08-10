import { DisabledButton, LinkButton } from '../ui/Button'
import { DONATE_ROW } from '../../content/involved'
import { DONATE_URL } from '../../content/election'

/**
 * The donate prompt at the foot of the form.
 *
 * While `DONATE_URL` is null the button is visibly present and visibly not
 * working, with the reason beside it. That is the behaviour election.ts
 * specifies, and it beats both alternatives: hiding it drops something the
 * campaign asked for, and wiring it to nothing sends a willing donor to an
 * error page, which is where most of them stop.
 *
 * The mockup opened a "coming soon" dialog instead. A dialog is a JavaScript
 * answer to a question a sentence already answers.
 */
export function DonateRow() {
  return (
    <div className="donate-row">
      <p className="donate-row__text">
        <span className="donate-row__lead">{DONATE_ROW.lead}</span> {DONATE_ROW.body}
      </p>
      <div className="donate-row__actions">
        {DONATE_URL === null ? (
          <>
            <DisabledButton variant="primary" describedBy="donate-unavailable">
              {DONATE_ROW.cta}
            </DisabledButton>
            <span className="note" id="donate-unavailable">
              {DONATE_ROW.unavailable}
            </span>
          </>
        ) : (
          <LinkButton variant="primary" href={DONATE_URL} external>
            {DONATE_ROW.cta}
          </LinkButton>
        )}
      </div>
    </div>
  )
}
