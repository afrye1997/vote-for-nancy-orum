import { Page } from '../components/layout/Page'
import { LinkButton } from '../components/ui/Button'
import { Photo } from '../components/ui/Photo'
import { IMAGES, imgSources } from '../content/images'
import { DONATE_ROW } from '../content/involved'
import { href } from '../content/site'

/**
 * The mockup's "coming soon" donate dialog, as a page.
 *
 * The Donate buttons are visible everywhere the design puts them, which needs
 * them to lead somewhere. The mockup opens a modal when `donateUrl` is empty;
 * a modal is component state and a fistful of JavaScript, and this site has
 * neither. A page has a URL, survives a refresh, and says the same thing.
 *
 * When `DONATE_URL` is set in election.ts, every Donate button points at the
 * real processor instead and this page stops being linked. Read the note beside
 * that constant first — turning on fundraising changes the campaign's Arkansas
 * Ethics Commission filing burden, so it is the candidate's call.
 */
export function Donate({ base }: { readonly base: string }) {
  return (
    <Page base={base} current="donate" tone="light">
      <section className="section container" style={{ textAlign: 'center' }}>
        <div className="reveal" style={{ maxWidth: 460, marginInline: 'auto' }}>
          <Photo {...imgSources(base, IMAGES.logoLockup)} image={IMAGES.logoLockup} eager />
          <h1 className="section__title" style={{ marginTop: 18 }}>
            Coming soon
          </h1>
          <p className="section__lede">
            {DONATE_ROW.unavailable} Check back soon — or reach out and we’ll let you know the
            moment they are.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 22 }}>
            <LinkButton variant="accent" href={href(base, 'involved/')}>
              Get involved
            </LinkButton>
            <LinkButton variant="secondary" href={href(base, '')}>
              Back to the campaign
            </LinkButton>
          </div>
        </div>
      </section>
    </Page>
  )
}
