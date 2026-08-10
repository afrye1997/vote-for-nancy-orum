import { Photo } from '../ui/Photo'
import { INVOLVED_HERO } from '../../content/involved'
import { IMAGES, imgSources } from '../../content/images'

export function InvolvedHero({ base }: { readonly base: string }) {
  return (
    <section className="page-hero on-dark">
      <Photo
        className="band__media"
        {...imgSources(base, IMAGES.communityEvent)}
        image={IMAGES.communityEvent}
        eager
      />
      <div className="band__scrim" />
      <div className="page-hero__inner container">
        <p className="eyebrow eyebrow--light">{INVOLVED_HERO.eyebrow}</p>
        <h1 className="page-hero__title">{INVOLVED_HERO.heading}</h1>
      </div>
    </section>
  )
}
