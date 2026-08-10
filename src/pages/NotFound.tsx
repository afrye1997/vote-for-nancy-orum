import { Page } from '../components/layout/Page'
import { LinkButton } from '../components/ui/Button'
import { href } from '../content/site'

/**
 * 404.
 *
 * GitHub Pages serves this file for any unknown path. Rendering it through the
 * same shell as everything else means a mistyped link still lands somewhere
 * that looks like the campaign and offers a way back, instead of on GitHub's
 * own error page.
 */
export function NotFound({ base }: { readonly base: string }) {
  return (
    <Page base={base} current="none" tone="light">
      <section className="section container" style={{ textAlign: 'center' }}>
        <h1 className="section__title">That page does not exist.</h1>
        <p className="section__lede" style={{ marginInline: 'auto', maxWidth: '44ch' }}>
          The link may be out of date, or the address mistyped.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
          <LinkButton variant="secondary" href={href(base, '')}>
            Back to the campaign
          </LinkButton>
        </div>
      </section>
    </Page>
  )
}
