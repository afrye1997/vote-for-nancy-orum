import { LinkButton } from '../ui/Button'
import { Photo } from '../ui/Photo'
import { IMAGES, imgSources } from '../../content/images'
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
 * The advocacy list stays inside the tinted card rather than spreading into a
 * full-width band of its own.
 *
 * The reasoning changed shape on 2026-09-02 and the conclusion held. It used to
 * be that six items in a band would sit one scroll above PlatformPreview's six
 * commitment cards with only the statistics between them. Then her six BECAME
 * the commitments, which made the preview a verbatim second printing of this
 * card — so the preview was deleted and this is the only place her six appear on
 * the home page. The card keeps them contained, and the button below carries the
 * onward push the preview used to.
 */
export function Statement({ base }: { readonly base: string }) {
  const statement = approvedStatement()
  return (
    <section className="split split--statement container">
      <div className="statement__col reveal">
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
        {/*
          The sign closes the column.

          The advocacy card beside this one is the taller of the two by a wide
          margin — six items against five paragraphs — so this column ran out
          with roughly 250px of empty page under the button. The sign fills it
          with the thing the whole section is arguing for, and it is the same
          derivative the footer already loads, so it costs a cache hit rather
          than a download.

          Not decorative, so not alt="". Someone who cannot see it should still
          learn that her sign carries the slogan the section closes on.
        */}
        <Photo
          className="statement__sign"
          {...imgSources(base, IMAGES.yardSign)}
          image={IMAGES.yardSign}
        />
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
