/**
 * Structured data: the JSON-LD graph each indexable page carries in its head.
 *
 * WHY THIS EXISTS (2026-09-02)
 * Three weeks after the domain went live, "nancy orum" on Google returned her
 * LinkedIn, her X account, a personal Facebook profile and an Amazon author
 * page — and not this site, which was not in the index at all. Nothing on the
 * page told a search engine that the site is *about a specific person*, or
 * which person; the title and description say so in prose, and prose is not
 * how entities are matched. This graph says it in the vocabulary Google reads:
 * here is a Person named Nancy Orum, this is her site, this is the committee
 * publishing it, and these are the same-entity profiles elsewhere.
 *
 * It is not a ranking trick and Google will not show a rich result for it.
 * What it does is remove ambiguity, so the site can become the canonical
 * answer for her name once it has been crawled and once anything links to it.
 *
 * RULES FOR THIS FILE
 * - Every fact here must also be visible on the site. Google's structured data
 *   policy forbids marking up content a reader cannot see, and the honest
 *   reason is stronger: a claim that appears only in markup is a claim nobody
 *   proofread. So no alma mater, no employer, no age — none of it is on the
 *   site, so none of it is here.
 * - The entity nodes (WebSite, Person, Organization) are emitted in full only
 *   on the two pages that are about them — the home page, where Google reads
 *   the site name and organization, and the About page, which is her profile.
 *   Every other page carries just itself and a stub of the WebSite it belongs
 *   to, so no page asserts facts its own body does not show.
 * - Nothing is written twice, with one exception. Names, seat, dates, contact
 *   and images all come from the modules that own them (site.ts, election.ts,
 *   images.ts). The exception is `jobTitle`, a literal copied from the About
 *   page's heading, because a heading is not a field to read a job title out
 *   of. If "Educator. Realtor. Neighbor." is ever reworded, change it here.
 * - `sameAs` is the list of pages that ARE the entity. The Organization gets
 *   the campaign's Facebook page, which is the committee's page. The Person
 *   gets nothing yet: her LinkedIn and X accounts would help — those are the
 *   pages currently outranking this one — but adding a URL here asserts it
 *   is hers, and that is for her to confirm, not for a developer to guess
 *   from a search result. See NEEDED-FROM-CAMPAIGN.md §11.
 *
 * Every node has an absolute `@id`, which is why the whole thing is null
 * without SITE_ORIGIN: a graph whose nodes cannot be addressed is a graph
 * nothing can join, and a preview build has no business publishing one anyway.
 */

import { COMMITTEE_NAME, CONTACT, GENERAL_ELECTION, RACE } from './election'
import { IMAGES } from './images'
import { SITE } from './site'

export type StructuredPage = {
  readonly id: string
  readonly title: string
  readonly description: string
  /** Site-relative, trailing slash, empty for home — as in PAGES_NAV. */
  readonly path: string
}

export type JsonLd = Record<string, unknown>

/**
 * The site's name, as Google's "site name" feature reads it: from WebSite.name
 * on the home page, and from og:site_name. Google asks that the Organization
 * carry the same name and alternateName, so the committee's legal name goes in
 * legalName rather than displacing it. Exported so prerender.mjs can emit the
 * og:site_name meta from the same string.
 */
export const SITE_NAME = `${SITE.candidate} for ${SITE.office}`
/** The domain, as words: votefornancyorum.com is the one place this appears. */
export const SITE_ALTERNATE_NAME = `Vote for ${SITE.candidate}`

export function structuredData(
  origin: string | null,
  base: string,
  page: StructuredPage,
): JsonLd | null {
  if (origin === null) return null

  const home = `${origin}${base}`
  const url = `${home}${page.path}`
  const ids = {
    website: `${home}#website`,
    person: `${home}#nancy-orum`,
    committee: `${home}#committee`,
  }

  /**
   * The committee's page, on the committee's node only. schema.org's sameAs
   * means "this URL is this thing", and one page cannot be both a person and
   * an organization, however much a campaign page speaks for both.
   */
  const committeeSameAs = CONTACT.facebookUrl === null ? [] : [CONTACT.facebookUrl]

  const website = {
    '@type': 'WebSite',
    '@id': ids.website,
    url: home,
    /* What Google shows as the site name above a result, when it chooses to. */
    name: SITE_NAME,
    alternateName: SITE_ALTERNATE_NAME,
    inLanguage: 'en-US',
    about: { '@id': ids.person },
    publisher: { '@id': ids.committee },
  }

  const person = {
    '@type': 'Person',
    '@id': ids.person,
    name: SITE.candidate,
    url: home,
    /* The hero photograph: a picture of her that is actually on the home page. */
    image: `${home}img/${IMAGES.heroArmsCrossed.file}`,
    description:
      `Candidate for ${SITE.office}, ${SITE.seat}, in ${SITE.city}, ${SITE.state}. ` +
      `General election ${GENERAL_ELECTION.display}.`,
    /* "Educator. Realtor. Neighbor." — the About page's heading. See the rules. */
    jobTitle: 'Realtor',
    homeLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: SITE.city,
        addressRegion: RACE.state,
        addressCountry: 'US',
      },
    },
    affiliation: { '@id': ids.committee },
  }

  const committee = {
    '@type': 'Organization',
    '@id': ids.committee,
    name: SITE_NAME,
    alternateName: SITE_ALTERNATE_NAME,
    /* "Paid for by the Committee to Elect Nancy Orum" — the footer, every page. */
    legalName: COMMITTEE_NAME,
    url: home,
    /*
     * The campaign's circular mark: the artwork on her printed material and on
     * the donate page. Not the header, which carries the wordmark lockups in
     * white and navy — the white one would vanish on Google's white background.
     * Google wants at least 112×112; this is 480.
     */
    logo: `${home}img/${IMAGES.logoCircle.file}`,
    email: CONTACT.email,
    sameAs: committeeSameAs,
  }

  /**
   * The About page is the one page whose subject IS the person, so it is typed
   * as a ProfilePage naming her as its main entity — the one Person shape
   * Google documents reading, and its docs list "About Me" pages as a valid
   * use (and a home page as an invalid one). Every other page is about her in
   * the looser sense a campaign site is.
   */
  const webPage =
    page.id === 'nancy'
      ? {
          '@type': 'ProfilePage',
          '@id': url,
          url,
          name: page.title,
          description: page.description,
          inLanguage: 'en-US',
          isPartOf: { '@id': ids.website },
          mainEntity: { '@id': ids.person },
        }
      : {
          '@type': 'WebPage',
          '@id': url,
          url,
          name: page.title,
          description: page.description,
          inLanguage: 'en-US',
          isPartOf: { '@id': ids.website },
          about: { '@id': ids.person },
        }

  /*
   * Full entity nodes only where the page is about them; elsewhere the page
   * and a stub of the site it belongs to, enough to join the graph by @id.
   */
  const entityPage = page.id === 'home' || page.id === 'nancy'
  const websiteStub = { '@type': 'WebSite', '@id': ids.website, url: home, name: SITE_NAME }
  return {
    '@context': 'https://schema.org',
    '@graph': entityPage ? [website, person, committee, webPage] : [websiteStub, webPage],
  }
}
