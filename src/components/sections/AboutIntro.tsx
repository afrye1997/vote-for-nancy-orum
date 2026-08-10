import { LinkButton } from '../ui/Button'
import { Photo } from '../ui/Photo'
import { ABOUT_INTRO } from '../../content/about'
import { IMAGES, imgSources } from '../../content/images'
import { href } from '../../content/site'

export function AboutIntro({ base }: { readonly base: string }) {
  return (
    <section className="split split--about split--centered container">
      <div className="about-portrait">
        <Photo
          {...imgSources(base, IMAGES.aboutArkansas)}
          image={IMAGES.aboutArkansas}
          eager
        />
      </div>
      <div>
        <p className="eyebrow">{ABOUT_INTRO.eyebrow}</p>
        <h1 className="section__title" style={{ fontSize: 'var(--text-4xl)' }}>
          {ABOUT_INTRO.heading}
        </h1>
        <div className="prose lede" style={{ marginTop: 16 }}>
          {ABOUT_INTRO.paragraphs.map((text) => (
            <p key={text.slice(0, 32)}>{text}</p>
          ))}
        </div>
        <div style={{ marginTop: 22 }}>
          <LinkButton variant="accent" href={href(base, 'involved/')}>
            {ABOUT_INTRO.cta}
          </LinkButton>
        </div>
      </div>
    </section>
  )
}
