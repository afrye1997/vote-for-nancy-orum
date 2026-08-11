import { Photo } from '../ui/Photo'
import { IMAGES, imgSources } from '../../content/images'
import { AT_LARGE_NOTICE, COMMITTEE_NAME, CONTACT, isPlaceholder } from '../../content/election'
import { NAV_PAGES, SITE, href } from '../../content/site'

/** A legally-significant value renders loudly if it is still unresolved. */
function Legal({ value }: { readonly value: string }) {
  return isPlaceholder(value) ? <strong className="placeholder">{value}</strong> : <>{value}</>
}

export function Footer({ base }: { readonly base: string }) {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner container">
        {/*
          Wrapped, deliberately. <Photo> renders a <picture>, and `picture` is
          `display: contents`, which dissolves it and promotes its children into
          this flex row. That leaves the row with more items than it looks like
          it has, and `justify-content: space-between` distributes them — the
          sign drifted off the container edge into the middle. A plain element
          gives the row exactly one child to place.
        */}
        <div>
          <Photo
            className="site-footer__sign"
            {...imgSources(base, IMAGES.footerSign)}
            image={IMAGES.footerSign}
          />
        </div>
        <div className="site-footer__meta">
          <nav className="site-footer__nav" aria-label="Footer">
            {NAV_PAGES.filter((page) => page.id !== 'home').map((page) => (
              <a key={page.id} href={href(base, page.path)}>
                {page.label}
              </a>
            ))}
          </nav>
          {SITE.seat} · {SITE.city}, {SITE.state}
          <br />
          Paid for by the <Legal value={COMMITTEE_NAME} />
          <div>We never share information you submit on this site.</div>
          {/* The one fact most likely to change whether a reader votes at all. */}
          <div className="site-footer__notice">{AT_LARGE_NOTICE.short}</div>
          {/*
            The address sits directly on top of the icon row, and the two are
            spaced to read as one block: the written-out address, then the same
            address as a button beside Facebook. Keep them adjacent if this ever
            moves again — split apart they look like two unrelated ways to make
            contact rather than one, which is what put the address in the middle
            of a run of interpunct-separated facts in the first place.
          */}
          <div className="site-footer__contact">
            <a href={`mailto:${CONTACT.email}`}>
              <Legal value={CONTACT.email} />
            </a>
            {CONTACT.phone === null ? null : (
              <>
                {' · '}
                <Legal value={CONTACT.phone} />
              </>
            )}
          </div>
          {/*
            Always rendered, because the address always exists — only the
            Facebook link is conditional. Mail sits first so the row reads in the
            order the campaign asked for, and both are real links rather than
            icon buttons: long-press, middle-click and "copy address" all work.
          */}
          <div className="site-footer__social">
            <a href={`mailto:${CONTACT.email}`} aria-label={`Email ${SITE.candidate}`}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z" />
              </svg>
            </a>
            {CONTACT.facebookUrl === null ? null : (
              <a
                href={CONTACT.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${SITE.candidate} on Facebook`}
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.2 0-1-.1-1.9-.1-1.9 0-3.2 1.1-3.2 3.3V11H9v3h2.3v7h2.2Z" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
