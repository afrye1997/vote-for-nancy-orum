import { Page } from '../components/layout/Page'
import { BallotCheck } from '../components/sections/BallotCheck'
import { InvolvedForm } from '../components/sections/InvolvedForm'
import { DonateRow } from '../components/sections/DonateRow'
import { InvolvedHero } from '../components/sections/InvolvedHero'
import { KeyDates } from '../components/sections/KeyDates'
import { INVOLVED_INTRO } from '../content/involved'

export function Involved({
  base,
  web3formsKey,
  thanksUrl,
  hcaptchaSiteKey,
}: {
  readonly base: string
  readonly web3formsKey: string | null
  readonly thanksUrl: string | null
  readonly hcaptchaSiteKey: string | null
}) {
  return (
    <Page base={base} current="involved" tone="dark">
      <InvolvedHero base={base} />
      <div className="container" style={{ paddingTop: 48 }}>
        <p className="involved__intro reveal">{INVOLVED_INTRO}</p>
        {/*
          The chip-in band leads the page, right under the intro — the campaign
          wants donating to be the first ask, not a card tucked under the
          calendar where it used to sit. It stays outside the form element for
          the same reason as ever: the form's whole job is one call to action,
          and this is a different one.
        */}
        <DonateRow base={base} />
        {/*
          A real <hr>, not a styled div. The subject changes here — how to help,
          then whether you can vote in this race — and a thematic break is what
          the element means. It is announced as a separator to anyone not
          looking at the page, which a decorative border would not be.
        */}
        <hr className="rule reveal" />
      </div>
      <BallotCheck base={base} />
      {/*
        Dates left, form right. Both components still bring their own
        page-width sizing for when they are used alone; `.involved-split`
        neutralises it and lets the grid own the widths. The columns are
        unequal on purpose — the form has far more in it than the calendar.
      */}
      <div className="involved-split container">
        <KeyDates />
        <InvolvedForm
          base={base}
          web3formsKey={web3formsKey}
          thanksUrl={thanksUrl}
          hcaptchaSiteKey={hcaptchaSiteKey}
        />
      </div>
    </Page>
  )
}
