import { useEffect, useRef, useState, type FormEvent } from 'react'
import { SubmitButton } from '../ui/Button'
import { Photo } from '../ui/Photo'
import { CheckboxField, RadioField, SelectField, TextAreaField, TextField } from '../ui/fields'
import { DonateRow } from './DonateRow'
import { FORM, PURPOSES } from '../../content/involved'
import { IMAGES, imgSources } from '../../content/images'
import { href } from '../../content/site'

/**
 * The contact form: a native POST to Web3Forms, working with JavaScript off.
 *
 * The mockup branches its fields on component state and swaps the whole card
 * for a thank-you panel on submit. The thank-you is a real page here instead,
 * because a panel has no URL. The branching is two layers, described below.
 *
 * Field `name`s are the words the campaign will read in the notification email,
 * so they are written for a human inbox rather than for a database.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY A HIDDEN BRANCH IS ALSO DISABLED
 * ─────────────────────────────────────────────────────────────────────────────
 * `display: none` hides a field; it does not take it out of the submission. So
 * with CSS alone an "Ask a question" message also carried an empty "Drop-off
 * address", and every submission carried "Wants updates: yes" from a checkbox
 * two thirds of visitors never saw. `disabled` is the attribute that removes a
 * control from the form data set — both for a native POST and for
 * `new FormData(form)` — and CSS cannot set it. React does, once hydrated.
 *
 * It is applied only when CSS is provably doing the hiding, which is what
 * `branchingLive` means. Two ways that can be false, and both must stay safe:
 * before hydration nothing is disabled, so a visitor with no JavaScript can
 * still fill in whichever branch the radios reveal; and in a browser without
 * `:has()` sections.css opens ALL THREE branches, where disabling two would
 * leave someone looking at fields that refuse to be typed in.
 *
 * The radios stay uncontrolled. React mirrors their DOM state and never
 * overrules it, because the DOM can legitimately disagree with the initial
 * state: a radio can be clicked before the bundle arrives, and browsers restore
 * form state across a reload without firing `change`. A controlled radio would
 * snap the selection back to "Join the campaign" on the first re-render.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THE SUBMIT IS INTERCEPTED
 * ─────────────────────────────────────────────────────────────────────────────
 * Web3Forms' `redirect` field only accepts an absolute URL, so the campaign's
 * own thank-you page needs SITE_ORIGIN — which needs the domain, which is not
 * bought. Until then a native POST lands on Web3Forms' generic confirmation
 * page. A hydrated browser can do better: post the same fields with `fetch` and
 * navigate to `thanks/` RELATIVELY, which needs no origin at all.
 *
 * The native `action`, `method` and `redirect` are untouched. They are the
 * no-JavaScript path, and they are also the failure path: anything that stops
 * the fetch — a blocker, an offline tab, a timeout, a rejection — falls through
 * to `form.submit()`, which is exactly what the browser would have done on its
 * own. The enhancement can never end worse than the thing it enhances.
 *
 * ⚠ Do NOT reach for `<form action={fn}>` / `useActionState` here, whatever
 * ENGINEERING.md §2.3 says. React 19 renders a function action as
 * `action="javascript:throw new Error(…)"` and drops `method` entirely, so the
 * form does nothing at all with JavaScript off.
 */

/** One endpoint for both paths. The fetch and the native `action` must agree. */
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'

/** `fetch` has no timeout of its own, and a button stuck on "Sending…" is worse
 *  than a plain POST. */
const SEND_TIMEOUT_MS = 15000

/** The branch open on arrival. Must match `defaultChecked={index === 0}`. */
const DEFAULT_PURPOSE = PURPOSES[0]!.id

/** `sent` is not a rendered state — it is the moment before a navigation. */
type Phase = 'idle' | 'sending' | 'sent'

export function InvolvedForm({
  base,
  web3formsKey,
  thanksUrl,
  turnstileSiteKey,
}: {
  readonly base: string
  readonly web3formsKey: string | null
  /** Absolute URL, or null when SITE_ORIGIN is unset. */
  readonly thanksUrl: string | null
  readonly turnstileSiteKey: string | null
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
    <ContactForm
      base={base}
      web3formsKey={web3formsKey}
      thanksUrl={thanksUrl}
      turnstileSiteKey={turnstileSiteKey}
    />
  )
}

/**
 * The form itself, split out because the guard above returns before any hook
 * could run and hooks cannot live after a conditional return.
 */
function ContactForm({
  base,
  web3formsKey,
  thanksUrl,
  turnstileSiteKey,
}: {
  readonly base: string
  readonly web3formsKey: string
  readonly thanksUrl: string | null
  readonly turnstileSiteKey: string | null
}) {
  const formRef = useRef<HTMLFormElement>(null)
  /* Constants, never measurements: the first client render has to reproduce the
     server's markup exactly (entry-client.tsx). Both are corrected in effects. */
  const [purpose, setPurpose] = useState(DEFAULT_PURPOSE)
  const [branchingLive, setBranchingLive] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')

  /*
   * Synchronises with two systems outside React: the browser's CSS engine, and
   * the radios' own DOM state, which may already disagree with DEFAULT_PURPOSE
   * by the time the bundle runs.
   */
  useEffect(() => {
    if (typeof CSS === 'undefined' || !CSS.supports('selector(:has(*))')) return
    const checked = formRef.current?.querySelector<HTMLInputElement>('input[name="Reason"]:checked')
    if (checked) setPurpose(checked.id)
    setBranchingLive(true)
  }, [])

  /*
   * Synchronises with the browser's back/forward cache. Returning from the
   * thank-you page restores this document with its JavaScript heap frozen
   * mid-send and re-runs no effect, so without this the visitor comes back to a
   * button that reads "Sending…" and never recovers.
   */
  useEffect(() => {
    const onShow = (event: PageTransitionEvent) => {
      if (event.persisted) setPhase('idle')
    }
    window.addEventListener('pageshow', onShow)
    return () => window.removeEventListener('pageshow', onShow)
  }, [])

  const send = async (form: HTMLFormElement) => {
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
      const body = new FormData(form)
      /*
       * `redirect` is what makes Web3Forms answer with a 3xx instead of JSON —
       * the vendor's own troubleshooting says to strip it from a JavaScript
       * submission. Only from the copy: the hidden input stays in the DOM,
       * where it is the entire no-JavaScript thank-you page.
       */
      body.delete('redirect')

      const abort = new AbortController()
      timer = setTimeout(() => abort.abort(), SEND_TIMEOUT_MS)
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        /* No Content-Type: the browser has to write the multipart boundary.
           Multipart and Accept are both CORS-safelisted, so this stays a simple
           request with no preflight. Sending urlencoded instead would come back
           as a redirect rather than JSON. */
        headers: { Accept: 'application/json' },
        body,
        signal: abort.signal,
      })
      const result = (await response.json()) as { success?: boolean }
      /* `response.ok` is not enough. A rejected key or a spam flag is a reply,
         not a network failure, and sending someone to a thank-you page for a
         message that was never delivered is the worst outcome available. */
      if (!response.ok || result.success !== true) throw new Error('Web3Forms rejected the submission')
      setPhase('sent')
      window.location.assign(href(base, 'thanks/'))
    } catch {
      /*
       * Blocked, offline, timed out, rejected — all the same to the visitor,
       * and all answered the same way: do what a browser with JavaScript
       * switched off would have done. `submit()`, not `requestSubmit()`, which
       * would fire this handler again.
       *
       * This can deliver twice, when the request did arrive and only the answer
       * was unreadable. A duplicate in the campaign's inbox costs a moment; a
       * volunteer who thinks they signed up and did not costs a volunteer.
       */
      form.submit()
    } finally {
      clearTimeout(timer)
    }
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (phase !== 'idle') return
    /* React nulls `currentTarget` the moment dispatch ends, so read it now. */
    const form = event.currentTarget
    setPhase('sending')
    void send(form)
  }

  const busy = phase !== 'idle'
  const hidden = (id: string) => branchingLive && purpose !== id

  return (
    <section className="form-wrap container">
      <form
        className="card form"
        id="involved-form"
        action={WEB3FORMS_ENDPOINT}
        method="POST"
        ref={formRef}
        onSubmit={onSubmit}
      >
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
            {PURPOSES.map((purposeOption, index) => (
              <RadioField
                key={purposeOption.id}
                id={purposeOption.id}
                name="Reason"
                value={purposeOption.value}
                label={purposeOption.label}
                defaultChecked={index === 0}
                onChange={() => setPurpose(purposeOption.id)}
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
            disabled={hidden('purpose-join')}
          />
          <CheckboxField
            id="updates"
            name="Wants updates"
            label={FORM.updates}
            defaultChecked
            disabled={hidden('purpose-join')}
          />
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
            disabled={hidden('purpose-sign')}
          />
        </div>

        <div className="form__branch form__branch--question">
          <TextAreaField
            id="question"
            name="Question"
            label={FORM.question.label}
            placeholder={FORM.question.placeholder}
            hint={FORM.question.hint}
            disabled={hidden('purpose-question')}
          />
        </div>

        {/*
          The announcer. It ships in the prerendered HTML and never unmounts,
          because a live region that arrives in the same commit as its text is
          routinely missed — a screen reader reads whatever is already inside a
          region as its starting state, not as a change. `display: none` would
          take it back out of the accessibility tree for the same reason.
          `.visually-hidden` is absolutely positioned, so it is not a flex item
          and adds no row to this card.
        */}
        <p className="visually-hidden" id="form-status" role="status">
          {phase === 'sending' ? FORM.status.announcing : phase === 'sent' ? FORM.status.sent : ''}
        </p>

        <SubmitButton variant="accent" size="lg" busy={busy}>
          {busy
            ? FORM.status.sending
            : PURPOSES.map((purposeOption) => (
                <span
                  key={purposeOption.id}
                  className={`form__submit-label form__submit-label--${purposeOption.id.replace('purpose-', '')}`}
                >
                  {purposeOption.submitLabel}
                </span>
              ))}
        </SubmitButton>
        {turnstileSiteKey === null ? null : (
          /*
           * Cloudflare Turnstile. The widget writes a `cf-turnstile-response`
           * field into the form, and Web3Forms rejects the submission if that
           * token is missing or already spent — the verification happens there,
           * against the secret key in their dashboard, never here.
           *
           * It needs JavaScript, so with the bundle blocked there is no token
           * and Web3Forms turns the submission away. That is the cost of
           * switching it on: the form stops being usable without JavaScript.
           * The honeypot above still works either way.
           */
          <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-theme="light" />
        )}
        <p className="note">{FORM.privacy}</p>
        <DonateRow />
      </form>
    </section>
  )
}
