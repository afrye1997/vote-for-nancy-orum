import { Page } from '../components/layout/Page'
import { LinkButton } from '../components/ui/Button'
import { THANKS } from '../content/involved'
import { href } from '../content/site'

/**
 * Where a successful submission lands. A hydrated browser navigates here itself
 * once its `fetch` comes back; with JavaScript off, Web3Forms redirects here,
 * but only once SITE_ORIGIN is set — the `redirect` field takes an absolute URL.
 *
 * The mockup showed this as the form card replacing its own contents. Leaving
 * the page is the better outcome anyway: this can be linked, it survives a
 * refresh, and the campaign can point an analytics goal at it.
 *
 * It is marked noindex, which is set on its PAGES_NAV entry rather than
 * rendered here — `renderToStaticMarkup` produces a fragment with no document
 * to hoist metadata into, so the `<head>` is prerender.mjs's job.
 */
export function Thanks({ base }: { readonly base: string }) {
  return (
    <Page base={base} current="thanks" tone="light">
      <section className="section container" style={{ textAlign: 'center' }}>
        <h1 className="section__title" style={{ color: 'var(--brand-primary)' }}>
          {THANKS.title}
        </h1>
        <p className="section__lede" style={{ marginInline: 'auto', maxWidth: '46ch' }}>
          {THANKS.body}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
          <LinkButton variant="secondary" href={href(base, '')}>
            {THANKS.cta}
          </LinkButton>
        </div>
      </section>
    </Page>
  )
}
