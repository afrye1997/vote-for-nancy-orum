import { LinkButton } from '../ui/Button'
import { approvedStatement } from '../../content/statement'
import { href } from '../../content/site'

/**
 * Her growth statement, beside the six things she would advocate for.
 *
 * Was `PowerMessage.tsx`, renamed with the copy it renders: "my power message"
 * is strategy-deck vocabulary, and it was reaching the page as an eyebrow in
 * capital letters above a paragraph written for voters.
 *
 * The advocacy list stays inside the tinted card rather than spreading into a
 * full-width band of its own. Six items in a band would sit one scroll above
 * `PlatformPreview`'s six commitment cards with only the statistics between
 * them, and a reader meeting two six-item groups that close together will try to
 * map one onto the other. Framed by her own eyebrow, the relationship stays
 * legible: this is what she would push for, those are how she would govern.
 */
export function Statement({ base }: { readonly base: string }) {
  const statement = approvedStatement()
  return (
    <section className="split split--statement container">
      <div className="reveal">
        <p className="eyebrow">{statement.eyebrow}</p>
        <h2 className="section__title">{statement.heading}</h2>
        {/*
          Her opening line runs directly under the heading rather than after the
          paragraphs, which is where she put it and where it does the most work:
          it is the thesis the two paragraphs below then argue for.
        */}
        <p className="split__emphasis">{statement.emphasis}</p>
        <div className="prose lede" style={{ marginTop: 16 }}>
          {statement.paragraphs.map((text) => (
            <p key={text.slice(0, 32)}>{text}</p>
          ))}
        </div>
        <div style={{ marginTop: 20 }}>
          <LinkButton variant="secondary" href={href(base, 'nancy/')}>
            {statement.cta}
          </LinkButton>
        </div>
      </div>
      <div className="card card--tint reveal">
        <p className="eyebrow">{statement.advocacyEyebrow}</p>
        <ul className="advocacy__list">
          {statement.advocacy.map((item) => (
            /*
              Keyed on `id`, never on the label or a slice of it: "Protect
              natural areas" and "Protect neighborhoods" share their first eight
              characters, and a truncated key would collide.
            */
            <li className="advocacy__item" key={item.id}>
              <p>
                {/*
                  The dash is written as an expression, not as bare JSX text.
                  Hero.tsx documents what this project's markup already did once
                  with whitespace around an inline element; a literal " — " here
                  is at the mercy of how the file happens to be wrapped.
                */}
                <span className="advocacy__label">{item.label}</span>
                {' — '}
                {item.body}
              </p>
              {item.aside ? <p className="advocacy__aside">{item.aside}</p> : null}
            </li>
          ))}
        </ul>
        <p className="advocacy__closer">{statement.closer}</p>
      </div>
    </section>
  )
}
