import { LinkButton } from '../ui/Button'
import { POWER_MESSAGE, VISION } from '../../content/home'
import { href } from '../../content/site'

/** Why she is running, beside the six-line statement of what that looks like. */
export function PowerMessage({ base }: { readonly base: string }) {
  return (
    <section className="split split--centered container">
      <div>
        <p className="eyebrow">{POWER_MESSAGE.eyebrow}</p>
        <h2 className="section__title">{POWER_MESSAGE.heading}</h2>
        <div className="prose lede" style={{ marginTop: 16 }}>
          {POWER_MESSAGE.paragraphs.map((text) => (
            <p key={text.slice(0, 32)}>{text}</p>
          ))}
        </div>
        <p className="split__emphasis">{POWER_MESSAGE.emphasis}</p>
        <div style={{ marginTop: 20 }}>
          <LinkButton variant="secondary" href={href(base, 'nancy/')}>
            {POWER_MESSAGE.cta}
          </LinkButton>
        </div>
      </div>
      <div className="card card--tint">
        <p className="eyebrow">{VISION.eyebrow}</p>
        <ul className="vision__list">
          {VISION.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="vision__closer">{VISION.closer}</p>
      </div>
    </section>
  )
}
