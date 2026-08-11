import { LinkButton } from '../ui/Button'
import { CTA_BAND } from '../../content/home'
import { href } from '../../content/site'

/** The closing band. Present on every page in the mockup, so it lives in the shell. */
export function CtaBand({ base }: { readonly base: string }) {
  return (
    <aside className="cta-band on-dark">
      <div className="cta-band__inner container">
        <div className="reveal">
          <p className="cta-band__title">{CTA_BAND.title}</p>
          <p className="cta-band__sub">{CTA_BAND.sub}</p>
        </div>
        <div className="btn-row">
          <LinkButton variant="accent" size="lg" href={href(base, 'involved/')}>
            Get involved
          </LinkButton>
          <LinkButton variant="inverse" size="lg" href={href(base, 'platform/')}>
            Read the platform
          </LinkButton>
        </div>
      </div>
    </aside>
  )
}
