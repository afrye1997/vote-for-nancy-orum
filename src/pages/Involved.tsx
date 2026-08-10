import { Page } from '../components/layout/Page'
import { BallotCheck } from '../components/sections/BallotCheck'
import { InvolvedForm } from '../components/sections/InvolvedForm'
import { InvolvedHero } from '../components/sections/InvolvedHero'
import { INVOLVED_INTRO } from '../content/involved'

export function Involved({
  base,
  web3formsKey,
  thanksUrl,
  turnstileSiteKey,
}: {
  readonly base: string
  readonly web3formsKey: string | null
  readonly thanksUrl: string | null
  readonly turnstileSiteKey: string | null
}) {
  return (
    <Page base={base} current="involved" tone="dark">
      <InvolvedHero base={base} />
      <div className="container" style={{ paddingTop: 48 }}>
        <p className="involved__intro">{INVOLVED_INTRO}</p>
      </div>
      <BallotCheck base={base} />
      <InvolvedForm
        base={base}
        web3formsKey={web3formsKey}
        thanksUrl={thanksUrl}
        turnstileSiteKey={turnstileSiteKey}
      />
    </Page>
  )
}
