/**
 * Nancy's growth statement, supplied by the candidate 2026-08-27.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HER WORDS ARE VERBATIM. DO NOT EDIT THEM.
 * ─────────────────────────────────────────────────────────────────────────────
 * She sent this by email, in her own words, together with her new logo, walk
 * card and yard signs, and she named what it replaces: "I got new text to go in
 * place of the 'I listen' text."
 *
 * It lives in its own module for the reason every other content file does: one
 * file, one provenance story. `bio.ts` is her verbatim. `platform.ts` is the
 * campaign's design project. `growth.ts` is parsed Census primaries.
 * `priorities.ts` is a drafting tool and is still gated shut. Leaving this in
 * `home.ts` would have put her strongest copy under a header that names the
 * design project as its source.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS FILE MATTERS MORE THAN ITS LENGTH SUGGESTS
 * ─────────────────────────────────────────────────────────────────────────────
 * This is the FIRST POLICY LANGUAGE IN HER OWN WORDS to go live on the site.
 * `bio.ts` states a growth position verbatim, but nothing renders that file —
 * `Biography.tsx` is imported by no page.
 *
 * These are real positions with real opponents. "Concentrate higher-impact
 * commercial and tourism development in appropriate activity areas" has people
 * on the other side of it, and so does "We need to do better by these dedicated
 * crews," which is a criticism of current provision with the sitting council as
 * its subject. `priorities.ts` refuses to publish exactly this class of claim on
 * her behalf. It ships here for one reason: she wrote it.
 *
 * Which is why it is reachable only through `approvedStatement()`. Do not copy
 * these strings into a plain exported constant to save an import — the gate is
 * the whole point, and a sentence this committal must never drift into the
 * codebase without the flag that says she stands behind it.
 *
 * NEVER SHARPEN IT. She wrote "what I would advocate for," which is a
 * conditional. Tightening any of it to "I will" promises something she did not.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT WAS CHANGED FROM HER EMAIL — ONE CHARACTER, AND NOTHING ELSE
 * ─────────────────────────────────────────────────────────────────────────────
 *   "makes sense-growth" → "makes sense—growth"
 *
 * A hyphen where an em dash belongs is email transport damage, not her
 * punctuation. It is set unspaced because that is her own em-dash style —
 * `bio.ts` has "people—the" and "live—it" and not one spaced dash in it.
 *
 * Her apostrophes are left straight, for the same reason. `bio.ts` carries 144
 * ASCII apostrophes and zero typographic ones, because the rule on this site is
 * not "normalise to typographic" — it is "the design project's copy is
 * typographic, the candidate's copy is hers." Do not curl `shouldn't`, `don't`,
 * `Let's` or `Here's`.
 *
 * Her capitals are left alone too, and there is one visible consequence: she
 * writes "Police, Fire, and EMS" and `growth.ts` lowercases the same three
 * departments further down the same page. Of the two inconsistencies on offer —
 * a candidate quoted inexactly, or a capital letter — the capital is cheaper.
 * (`GROWTH_INTRO.note` dropped its own enumeration in the same commit so the
 * two lists no longer sit side by side.)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ⚠ THIS DOES NOT APPROVE `priorities.ts`
 * ─────────────────────────────────────────────────────────────────────────────
 * The tempting misreading, and the most expensive one available here. Her
 * infrastructure item is a SEQUENCING position: verify capacity before we
 * encourage growth. The gated plank in that file is a COST-ALLOCATION position:
 * "New development pays its own way for the infrastructure it requires."
 * Different commitments, different opponents. She has made the first and not
 * the second. `PRIORITIES_APPROVED_BY_CANDIDATE` stays false.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CONFIRMED BY HER, 2026-09-02
 * ─────────────────────────────────────────────────────────────────────────────
 *  1. The hero line. Her statement runs ~400 words and `SITE.heroLede` is one
 *     line over a photograph, so the statement lives here and that slot took the
 *     second half of her closing sentence. She confirmed that is the sentence
 *     she wants up there. See the 2026-08-27 note in site.ts.
 *  2. The headline's capitals. RESTORED at her request — see the note on
 *     `heading` below. It had been set in sentence case to match the rest of the
 *     site; she wants her capitals, so it keeps them.
 *  3. "little Sugar Creek." CHANGED to "Little Sugar Creek" at her request: she
 *     was asked whether the lowercase was affection or a mis-cased proper noun
 *     and chose the proper name.
 *
 *     ⚠ The rest of that sentence stands unchanged and still needs care. This is
 *     the site's only reference to a named third-party project, and it asserts a
 *     benefit — "will benefit our residents" — that nobody here has verified. It
 *     is published as her opinion, which it is. Do not let a later editor mistake
 *     it for a checked claim.
 *  4. The two eyebrows — "Where I stand" and "What I would advocate for" — both
 *     confirmed. ("My power message" was strategy-deck vocabulary being rendered
 *     to voters in capitals. `PRIORITIES_INTRO.eyebrow` is also "Where I stand":
 *     harmless while nothing renders that file, a collision the day anything
 *     does.)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * STILL OPEN — one question, and it does not block the page
 * ─────────────────────────────────────────────────────────────────────────────
 *  5. What retired. Six one-line vision items from the design project went when
 *     her statement replaced them, including "Build partnerships instead of
 *     silos" and "Learn from successful organizations and communities." She was
 *     asked whether she wanted any of the six kept and answered "yes" to a
 *     question phrased so that yes and no both read as agreement — so the answer
 *     is not usable and has been put back to her. The themes still reach the same
 *     page through commitment 04's card, so nothing is lost while this is open.
 */

export type AdvocacyItem = {
  readonly id: string
  /** The advocacy heading. Set semibold, ahead of the em dash. */
  readonly label: string
  /** What she would do. Stored without the colon that joined the two by email. */
  readonly body: string
  /**
   * Her own added sentence, where she added one.
   *
   * Three of the six have one and three do not, so this is optional rather than
   * an empty string: an absent field renders nothing, where `''` renders an
   * empty paragraph that still carries its margins.
   */
  readonly aside?: string
}

export type Statement = {
  readonly eyebrow: string
  readonly heading: string
  /** Her opening line, and the thesis the rest of it argues. */
  readonly emphasis: string
  readonly paragraphs: readonly string[]
  readonly cta: string
  readonly advocacyEyebrow: string
  readonly advocacy: readonly AdvocacyItem[]
  /** The line on her yard signs and the red banner of her walk card. */
  readonly closer: string
}

/**
 * APPROVAL GATE.
 *
 * True because this text is hers, received directly from her. If any of it is
 * ever reworded by anyone other than the candidate, set this false and leave it
 * false until she has read the new wording — the build will stop rather than
 * publish words she did not write.
 */
export const STATEMENT_APPROVED_BY_CANDIDATE = true

/**
 * The only way to reach the statement, and the whole of the gate.
 *
 * Same arrangement as `approvedPlanks()` in priorities.ts, and for the same
 * reason recorded there: a bare boolean nobody reads cannot block anything.
 * Prerendering runs the SSR bundle in Node, so a false flag fails the build
 * instead of quietly shipping a page with a hole in it.
 */
export function approvedStatement(): Statement {
  if (!STATEMENT_APPROVED_BY_CANDIDATE) {
    throw new Error(
      'statement.ts: this growth statement is the candidate\'s own policy language. ' +
        'Set STATEMENT_APPROVED_BY_CANDIDATE only after she has read the current ' +
        'wording word for word. See the note at the top of that file.',
    )
  }
  return STATEMENT
}

const STATEMENT: Statement = {
  eyebrow: 'Where I stand',
  /*
   * Her capitals, restored 2026-09-02 at her request. It was set in sentence
   * case to match every other heading on the site; she was asked and said she
   * wanted the capitals back, so this heading is now the one place on the site
   * that is title case. That is a deliberate exception, not an oversight —
   * leave it alone.
   */
  heading: 'Protect What We Love. Plan What Comes Next.',
  emphasis: 'I believe Bella Vista can move forward without losing what makes us Bella Vista.',
  paragraphs: [
    "Growth shouldn't mean commercial development everywhere, clear-cutting our natural landscape, overwhelming our roads, or changing the character of our neighborhoods.",
    'We need smart economic growth where it makes sense—growth that strengthens our tax base while protecting the neighborhoods, wildlife, natural beauty, and quality of life that make Bella Vista special.',
    "I don't want Bella Vista to become more like somewhere else. I want us to become an even better Bella Vista.",
  ],
  cta: 'More about Nancy',
  advocacyEyebrow: 'What I would advocate for',
  advocacy: [
    {
      id: 'natural-areas',
      label: 'Protect natural areas',
      body: 'Strengthen reasonable tree preservation, buffers, drainage, and environmentally sensitive development standards.',
      /*
       * "little Sugar Creek" → "Little Sugar Creek", 2026-09-02. She was asked
       * whether the lowercase was affection or a mis-cased proper noun, and she
       * chose the proper name. The watercourse is Little Sugar Creek.
       */
      aside:
        'A great example is what is happening with our Little Sugar Creek. What an exciting project that will benefit our residents.',
    },
    {
      id: 'neighborhoods',
      label: 'Protect neighborhoods',
      body: 'Concentrate higher-impact commercial and tourism development in appropriate activity areas, not throughout residential Bella Vista.',
    },
    {
      /**
       * She wrote "Address traffic BEFORE development". The capitals are
       * emphasis, and emphasis is the typeface's job here — the label is set in
       * semibold ahead of the em dash, which is what the shouting was reaching
       * for. The words are unchanged.
       */
      id: 'traffic-first',
      label: 'Address traffic before development',
      body: 'Evaluate traffic and road capacity before approving major projects.',
    },
    {
      id: 'infrastructure',
      label: 'Verify infrastructure',
      body: 'Make sure roads, sewer, utilities, Police, Fire, and EMS can support significant growth before we encourage it.',
      aside:
        'This is an area of immediate concern. We all want a safe, secure place to live above all else. We need to do better by these dedicated crews.',
    },
    {
      id: 'residents-voice',
      label: 'Give residents a voice',
      body: 'Make major proposals easy to understand and provide meaningful opportunities for affected residents to be heard.',
    },
    {
      id: 'tourism',
      label: 'Make tourism work for residents',
      body: 'Focus on getting visitors already here to eat, shop and spend locally rather than simply chasing more tourists.',
      aside: "Let's make sure they spend their dollars here and not in our neighboring cities.",
    },
  ],
  closer: 'Protect. Plan. Prosper.',
}

/**
 * SUPERSEDED 2026-08-27, kept for the same reason site.ts keeps its corrections:
 * so the next person to read this file can see what changed rather than
 * wondering whether something was lost.
 *
 * The design project's version, which this replaced:
 *
 *   heading   "We can protect what we love while planning wisely for what comes
 *              next."
 *   emphasis  "I believe we can move Bella Vista forward without losing what
 *              makes it extraordinary."
 *   closer    "And most importantly, we can do it together."
 *
 *   the six one-line vision items
 *             "Listen before we lead."
 *             "Plan instead of simply react."
 *             "Learn from successful organizations and communities."
 *             "Build partnerships instead of silos."
 *             "Solve problems instead of creating division."
 *             "Welcome progress while protecting what makes Bella Vista special."
 *
 * Her headline and her opening line are recognisably rewrites of the first two.
 * The six items are not rewrites of anything — the six-and-six count is a
 * coincidence, and hers are policy where these were process.
 */
