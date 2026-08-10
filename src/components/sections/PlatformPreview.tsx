import { LinkButton } from '../ui/Button'
import { COMMITMENTS, PLATFORM_PREVIEW } from '../../content/platform'
import { href } from '../../content/site'

/** The six commitments in brief, linking through to the platform page. */
export function PlatformPreview({ base }: { readonly base: string }) {
  return (
    <section className="section section--tinted">
      <div className="container">
        <p className="eyebrow">{PLATFORM_PREVIEW.eyebrow}</p>
        <h2 className="section__title">{PLATFORM_PREVIEW.heading}</h2>
        <ul className="plank-grid">
          {COMMITMENTS.map((commitment, index) => (
            <li className="card plank-card" key={commitment.id}>
              <h3 className="plank-card__title">
                <span className="plank-card__num">{index + 1}.</span> {commitment.cardTitle}
              </h3>
              <p className="plank-card__body">{commitment.lede}</p>
            </li>
          ))}
        </ul>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 26 }}>
          <LinkButton href={href(base, 'platform/')}>{PLATFORM_PREVIEW.cta}</LinkButton>
        </div>
      </div>
    </section>
  )
}
