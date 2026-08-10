import { renderToString } from 'react-dom/server'
import { PAGE_COMPONENTS, type PageProps } from './pages/registry'
import { PAGES_NAV } from './content/site'
import { PLATFORM_APPROVED_BY_CANDIDATE } from './content/platform'

/**
 * Build-time rendering entry point.
 *
 * `renderToString`, not `renderToStaticMarkup`. The static variant strips the
 * comment markers React uses to locate Suspense boundaries and text nodes when
 * it hydrates; without them, hydration of any tree containing conditional text
 * warns and re-renders. Now that the client hydrates, the markers earn their
 * bytes.
 *
 * The page list is derived from PAGES_NAV, so navigation and the prerender list
 * cannot drift apart, and the component for each id comes from the same
 * registry the browser uses.
 */

export type RenderOpts = {
  base: string
  web3formsKey: string | null
  /** Absolute origin, e.g. https://nancyorum.com. Null until the domain exists. */
  origin: string | null
  turnstileSiteKey: string | null
}

export const PAGES = PAGES_NAV.map((p) => ({
  id: p.id,
  /** Output path relative to dist/. Home is index.html; others are dir/index.html. */
  out: p.path === '' ? 'index.html' : `${p.path}index.html`,
  title: p.title,
  description: p.description,
  path: p.path,
  noindex: p.noindex === true,
}))

/**
 * The props the client needs to reproduce this render exactly. Serialised into
 * the document by prerender.mjs and read back by entry-client.tsx; if the two
 * ever disagree, hydration throws the server markup away.
 */
function pageProps(opts: RenderOpts): PageProps {
  return {
    base: opts.base,
    web3formsKey: opts.web3formsKey,
    thanksUrl: opts.origin === null ? null : `${opts.origin}${opts.base}thanks/`,
    turnstileSiteKey: opts.turnstileSiteKey,
  }
}

export function renderPage(id: string, opts: RenderOpts): { html: string; props: object } {
  /**
   * Approval gate (ENGINEERING.md §6). The six commitments are first-person
   * promises; if the flag in platform.ts is ever turned off, the build stops
   * rather than quietly publishing them.
   */
  if (!PLATFORM_APPROVED_BY_CANDIDATE) {
    throw new Error(
      'PLATFORM_APPROVED_BY_CANDIDATE is false — the six commitments are not cleared to publish. ' +
        'See src/content/platform.ts.',
    )
  }

  const Page = PAGE_COMPONENTS[id]
  if (!Page) throw new Error(`No renderer for page id "${id}" — add it to pages/registry.tsx.`)

  const props = pageProps(opts)
  return { html: renderToString(<Page {...props} />), props: { ...props, page: id } }
}

/** The 404 body. Not in PAGES — it is written to dist/404.html, not to a route. */
export function renderNotFound(opts: RenderOpts): { html: string; props: object } {
  return renderPage('not-found', opts)
}
