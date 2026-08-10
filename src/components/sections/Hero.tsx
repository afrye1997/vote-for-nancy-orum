import { Fragment } from 'react'
import { LinkButton } from '../ui/Button'
import { Photo } from '../ui/Photo'
import { HERO_ACTIONS } from '../../content/home'
import { IMAGES, imgSources } from '../../content/images'
import { DONATE_URL } from '../../content/election'
import { SITE, href } from '../../content/site'

/**
 * The home hero: photograph, scrim, and her refrain arriving one clause at a
 * time.
 *
 * The gradient underneath the photograph is not decoration — it is what the
 * panel sits on for the fraction of a second before a five-megapixel JPEG
 * decodes, and it keeps the white type legible throughout.
 */
export function Hero({ base }: { readonly base: string }) {
  return (
    <section className="hero on-dark">
      <Photo
        className="hero__media"
        {...imgSources(base, IMAGES.heroArmsCrossed)}
        image={IMAGES.heroArmsCrossed}
        eager
      />
      <div className="hero__scrim" />
      <div className="hero__inner container">
        <div className="hero__panel">
          <p className="eyebrow eyebrow--light">{SITE.heroEyebrow}</p>
          {/*
            The space belongs BETWEEN the spans, not inside them. Each clause is
            an inline-block so it can be transformed, and trailing whitespace
            inside an inline-block is trimmed — which ran the first two clauses
            together as "Listening.Serving."
          */}
          <h1 className="hero__title">
            {SITE.taglineSegments.map((segment, index) => (
              <Fragment key={segment}>
                {index > 0 ? ' ' : null}
                <span>{segment}</span>
              </Fragment>
            ))}
          </h1>
          <p className="hero__lede">{SITE.heroLede}</p>
          <div className="btn-row hero__actions">
            <span className="btn-lift">
              <LinkButton variant="accent" size="lg" href={href(base, 'involved/')}>
                {HERO_ACTIONS.join}
              </LinkButton>
            </span>
            <span className="btn-lift">
              <LinkButton variant="inverse" size="lg" href={href(base, 'nancy/')}>
                {HERO_ACTIONS.about}
              </LinkButton>
            </span>
            <span className="btn-lift">
              {DONATE_URL === null ? (
                <LinkButton variant="primary" size="lg" href={href(base, 'donate/')}>
                  Donate
                </LinkButton>
              ) : (
                <LinkButton variant="primary" size="lg" href={DONATE_URL} external>
                  Donate
                </LinkButton>
              )}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
