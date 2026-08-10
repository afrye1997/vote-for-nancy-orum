import { hydrateRoot } from 'react-dom/client'
import { PAGE_COMPONENTS, type PageProps } from './pages/registry'
import './styles/index.css'

/**
 * Client entry.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT CHANGED, AND WHY IT MATTERS
 * ─────────────────────────────────────────────────────────────────────────────
 * Until now React ran only at build time: `renderToStaticMarkup` produced HTML
 * files and no React reached the browser. That is what ENGINEERING.md §1
 * describes, and it is why the carousel, the form's branching fields and the
 * donate dialog were CSS rather than state.
 *
 * The site now hydrates. Every page ships React and picks up the prerendered
 * markup, so components can hold state and the mockup's interactions are real
 * components rather than approximations of them.
 *
 * The prerendering stays. This is hydration, not a single-page app: each URL is
 * still a complete HTML document that renders without JavaScript, so crawlers,
 * link previews and a visitor on a bad connection all get the content. React
 * takes over an already-painted page rather than building it from nothing.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE RULE HYDRATION IMPOSES
 * ─────────────────────────────────────────────────────────────────────────────
 * The first client render must produce exactly the markup the server produced.
 * Anything that differs — a date formatted from `new Date()`, a random id, a
 * value read from `window` during render — is a hydration mismatch, and React
 * will discard the server HTML and re-render the whole tree. Initial state must
 * therefore be a constant, not a measurement. Read the DOM in an effect.
 */

const el = document.getElementById('root')
const data = document.getElementById('page-data')

if (el && data?.textContent) {
  const props = JSON.parse(data.textContent) as PageProps & { page: string }
  const Page = PAGE_COMPONENTS[props.page]
  if (Page) hydrateRoot(el, <Page {...props} />)
}
