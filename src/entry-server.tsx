import { renderToString } from 'react-dom/server'
import { PAGE_COMPONENTS, type PageProps } from './pages/registry'
import { PAGES_NAV, SEO } from './content/site'

import {
  SITE_NAME,
  structuredData as buildStructuredData,
  type StructuredPage,
} from './content/structured'

/**
 * The JSON-LD graph and the site name, handed to prerender.mjs from the one
 * bundle it already imports rather than by compiling src/ a second way.
 *
 * Functions, not `export { … } from`: oxlint's only-export-components rule
 * reads a re-export list as a possible component and then flags every other
 * export in the file. This entry is never hot-reloaded, so the rule has nothing
 * to protect here, but two functions cost less than a disable comment on each
 * of the exports it would go on to complain about.
 */
export function structuredData(origin: string | null, base: string, page: StructuredPage) {
  return buildStructuredData(origin, base, page)
}

/** The string WebSite.name carries, for the og:site_name meta. */
export function siteName(): string {
  return SITE_NAME
}

/**
 * Search-engine ownership tags for the head: each engine's meta name and the
 * token it issued, skipping any that is null. See SEO in site.ts.
 */
export function verificationTags(): { name: string; content: string }[] {
  return [
    { name: 'google-site-verification', content: SEO.googleSiteVerification },
    { name: 'msvalidate.01', content: SEO.bingSiteVerification },
  ].filter((tag): tag is { name: string; content: string } => tag.content !== null)
}

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
  hcaptchaSiteKey: string | null
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
    hcaptchaSiteKey: opts.hcaptchaSiteKey,
  }
}

export function renderPage(id: string, opts: RenderOpts): { html: string; props: object } {
  /*
   * The approval gate that stood here is not gone, it moved.
   *
   * `PLATFORM_APPROVED_BY_CANDIDATE` was deleted on 2026-09-02 with the copy it
   * guarded. The six commitments are now Nancy's own advocacy points, and
   * `platform.ts` derives them by calling `approvedStatement()` at module scope —
   * so importing that file at all runs `STATEMENT_APPROVED_BY_CANDIDATE`, and a
   * false flag fails the build here exactly as this check used to.
   *
   * One flag, not two. Two flags over one body of text is a trap: flip one and
   * the other page keeps publishing.
   */
  const Page = PAGE_COMPONENTS[id]
  if (!Page) throw new Error(`No renderer for page id "${id}" — add it to pages/registry.tsx.`)

  const props = pageProps(opts)
  return { html: renderToString(<Page {...props} />), props: { ...props, page: id } }
}

/** The 404 body. Not in PAGES — it is written to dist/404.html, not to a route. */
export function renderNotFound(opts: RenderOpts): { html: string; props: object } {
  return renderPage('not-found', opts)
}
