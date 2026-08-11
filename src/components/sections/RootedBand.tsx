import { Photo } from '../ui/Photo'
import { ROOTED_BAND } from '../../content/about'
import { IMAGES, imgSources } from '../../content/images'

/** Full-bleed photograph closing the About page. */
export function RootedBand({ base }: { readonly base: string }) {
  return (
    <section className="band on-dark">
      <Photo
        className="band__media"
        {...imgSources(base, IMAGES.familySquare)}
        image={{ ...IMAGES.familySquare, focus: '50% 33%' }}
      />
      <div className="band__scrim" />
      <div className="band__inner container">
        <div className="reveal">
          <p className="eyebrow eyebrow--light">{ROOTED_BAND.eyebrow}</p>
          <p className="band__line">{ROOTED_BAND.line}</p>
        </div>
      </div>
    </section>
  )
}
