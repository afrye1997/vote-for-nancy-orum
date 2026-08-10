import { SubmitButton } from '../ui/Button'
import { Photo } from '../ui/Photo'
import { CheckboxField, RadioField, SelectField, TextAreaField, TextField } from '../ui/fields'
import { DonateRow } from './DonateRow'
import { FORM, PURPOSES } from '../../content/involved'
import { IMAGES, imgSources } from '../../content/images'

/**
 * The contact form: a native POST to Web3Forms, working with JavaScript off.
 *
 * The mockup branches its fields on component state and swaps the whole card
 * for a thank-you panel on submit. Neither survives here. The branching is CSS
 * (`:has()`, see sections.css) and the thank-you is a real page Web3Forms
 * redirects to — which is better anyway, because it has a URL.
 *
 * Field `name`s are the words the campaign will read in the notification email,
 * so they are written for a human inbox rather than for a database.
 *
 * One consequence of branching in CSS: a hidden branch's fields are still in
 * the form, so a question submission also carries an empty "Drop-off address".
 * Harmless, and worth knowing before someone reports it as a bug. Suppressing
 * them would take the `disabled` attribute, which CSS cannot set.
 */
export function InvolvedForm({
  base,
  web3formsKey,
  thanksUrl,
}: {
  readonly base: string
  readonly web3formsKey: string | null
  /** Absolute URL, or null when SITE_ORIGIN is unset. */
  readonly thanksUrl: string | null
}) {
  if (web3formsKey === null) {
    return (
      <section className="form-wrap container" id="involved-form">
        <div className="card form">
          <h2 className="form__title">{FORM.notConfigured.title}</h2>
          <p className="lede">{FORM.notConfigured.body}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="form-wrap container">
      <form className="card form" id="involved-form" action="https://api.web3forms.com/submit" method="POST">
        <input type="hidden" name="access_key" value={web3formsKey} />
        <input type="hidden" name="subject" value="New message from the campaign site" />
        <input type="hidden" name="from_name" value="Nancy Orum campaign site" />
        {thanksUrl === null ? null : <input type="hidden" name="redirect" value={thanksUrl} />}
        {/*
          Web3Forms' honeypot. `display: none` rather than the visually-hidden
          class: this must be absent from the accessibility tree too, or a
          screen-reader user meets an unlabelled checkbox that will silently
          discard their message if they tick it.
        */}
        <input type="checkbox" name="botcheck" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

        <h2 className="form__title">{FORM.title}</h2>

        <fieldset className="form__purpose">
          <legend>{FORM.purposeLegend}</legend>
          <div className="form__purpose-options">
            {PURPOSES.map((purpose, index) => (
              <RadioField
                key={purpose.id}
                id={purpose.id}
                name="Reason"
                value={purpose.value}
                label={purpose.label}
                defaultChecked={index === 0}
              />
            ))}
          </div>
        </fieldset>

        <div className="form__grid">
          <TextField
            id="first-name"
            name="First name"
            label={FORM.firstName.label}
            placeholder={FORM.firstName.placeholder}
            autoComplete="given-name"
            required
          />
          <TextField
            id="last-name"
            name="Last name"
            label={FORM.lastName.label}
            placeholder={FORM.lastName.placeholder}
            autoComplete="family-name"
            required
          />
        </div>
        <TextField
          id="email"
          name="Email"
          type="email"
          label={FORM.email.label}
          placeholder={FORM.email.placeholder}
          autoComplete="email"
          required
        />

        <div className="form__branch form__branch--join">
          <SelectField
            id="help"
            name="How they can help"
            label={FORM.help.label}
            placeholder={FORM.help.placeholder}
            options={FORM.help.options}
          />
          <CheckboxField id="updates" name="Wants updates" label={FORM.updates} defaultChecked />
        </div>

        <div className="form__branch form__branch--sign">
          <div className="sign-offer">
            <Photo
              {...imgSources(base, IMAGES.yardSign)}
              image={IMAGES.yardSign}
            />
            <p className="sign-offer__text">
              <span className="sign-offer__lead">{FORM.signOffer.lead}</span>{' '}
              {FORM.signOffer.body}
            </p>
          </div>
          <TextField
            id="drop-address"
            name="Drop-off address"
            label={FORM.signOffer.addressLabel}
            placeholder={FORM.signOffer.addressPlaceholder}
            autoComplete="street-address"
          />
        </div>

        <div className="form__branch form__branch--question">
          <TextAreaField
            id="question"
            name="Question"
            label={FORM.question.label}
            placeholder={FORM.question.placeholder}
            hint={FORM.question.hint}
          />
        </div>

        <SubmitButton variant="accent" size="lg">
          {PURPOSES.map((purpose) => (
            <span
              key={purpose.id}
              className={`form__submit-label form__submit-label--${purpose.id.replace('purpose-', '')}`}
            >
              {purpose.submitLabel}
            </span>
          ))}
        </SubmitButton>
        <p className="note">{FORM.privacy}</p>
        <DonateRow />
      </form>
    </section>
  )
}
