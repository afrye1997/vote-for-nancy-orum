import { LinkButton } from '../ui/Button'
import { StaggerTitle } from '../ui/StaggerTitle'
import { Photo } from '../ui/Photo'
import { ABOUT_INTRO } from '../../content/about'
import { IMAGES, imgSources } from '../../content/images'
import { href } from '../../content/site'

export function AboutIntro({ base }: { readonly base: string }) {
  return (
    <section className="split split--about split--centered container">
      <div className="about-portrait reveal">
        <Photo
          {...imgSources(base, IMAGES.aboutArkansas)}
          image={IMAGES.aboutArkansas}
          eager
        />
      </div>
      <div className="reveal">
        <p className="eyebrow">{ABOUT_INTRO.eyebrow}</p>
        <StaggerTitle
          className="section__title"
          style={{ fontSize: 'var(--text-4xl)' }}
          segments={ABOUT_INTRO.headingSegments}
          accent={ABOUT_INTRO.headingAccent}
        />
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
