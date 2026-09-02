import { LinkButton } from '../ui/Button'
import { PLATFORM_PREVIEW_CTA } from '../../content/platform'
import { approvedStatement } from '../../content/statement'
import { href } from '../../content/site'

/**
 * Her growth statement, beside the six things she would advocate for.
 *
 * Was `PowerMessage.tsx`, renamed with the copy it renders: "my power message"
 * is strategy-deck vocabulary, and it was reaching the page as an eyebrow in
 * capital letters above a paragraph written for voters.
 *
 * The advocacy card lists her six HEADINGS ONLY. The sentences under them, and
 * the asides she added to three of them, are on the platform page.
 *
 * That split was the campaign's call on 2026-09-02 — "leave the extra info for
 * the platform page" — and it settles a problem this section had been working
 * around for a week. Her six used to appear here in full AND on the platform
 * page in full, because they are the same six; the home page was carrying a
 * complete copy of another page. Now the home page says what she would advocate
 * for and the platform page says what each one means, which is the division the
 * two pages should have had from the start.
 *
 * It also makes the card scannable. Six headings read in a glance; six headings
 * each trailing a 40-word sentence do not.
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
              {item.label}
            </li>
          ))}
        </ul>
        <p className="advocacy__closer">{statement.closer}</p>
        {/*
          The route to the platform page, and since 2026-09-02 the main one from
          this page. The six flip cards that used to carry people there were
          removed because they restated these exact sentences one section below
          this card. Primary rather than secondary: this is now the principal
          onward link on the home page, not a secondary option beside it.
        */}
        <div style={{ marginTop: 20 }}>
          <LinkButton variant="primary" href={href(base, 'platform/')}>
            {PLATFORM_PREVIEW_CTA}
          </LinkButton>
        </div>
      </div>
    </section>
  )
}
