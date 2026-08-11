import { LinkButton } from '../ui/Button'
import { DONATE_ROW } from '../../content/involved'
import { DONATE_URL } from '../../content/election'
import { href } from '../../content/site'

/**
 * The donate prompt.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE BUTTON ALWAYS WORKS. WHERE IT GOES IS WHAT CHANGES.
 * ─────────────────────────────────────────────────────────────────────────────
 * With `DONATE_URL` set it goes to the processor. With it null it goes to
 * `donate/`, the page that says donations are not open yet and offers two ways
 * back into the campaign. Either way the visitor gets somewhere that answers
 * them, which is the whole point.
 *
 * This used to render a dimmed, inert button instead — present but dead, with
 * the reason beside it. Two things were wrong with that. It disagreed with the
 * rest of the site, where the header and the home hero have always routed to
 * `donate/` under exactly the same condition, so the same control behaved
 * differently depending on which one you happened to press. And a dimmed
 * control is a dead end: someone who wants to give reads "not yet" and has
 * nowhere to go, when there is in fact a page telling them what to do instead.
 *
 * The sentence below the button stays. It sets the expectation before the click
 * rather than after it, which is worth more than the extra tap it saves.
 *
 * `donate/` stops being linked the moment `DONATE_URL` is set — see the note
 * beside that constant, which the campaign has to make a decision about before
 * any of this goes live.
 */
export function DonateRow({ base }: { readonly base: string }) {
  return (
    <div className="donate-row">
      <p className="donate-row__text">
        <span className="donate-row__lead">{DONATE_ROW.lead}</span>
        {DONATE_ROW.body}
      </p>
      <div className="donate-row__actions">
        {DONATE_URL === null ? (
          <>
            <LinkButton variant="primary" href={href(base, 'donate/')}>
              {DONATE_ROW.cta}
            </LinkButton>
            <span className="note">{DONATE_ROW.unavailable}</span>
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
