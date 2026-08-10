import { useEffect, useRef, useState, type FormEvent } from 'react'
import { SubmitButton } from '../ui/Button'
import { Photo } from '../ui/Photo'
import { Turnstile } from '../ui/Turnstile'
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
 * ⚠ ONE EXCEPTION, AND IT IS LOAD-BEARING: `email` is lowercase. Web3Forms
 * reserves that exact name and derives the `Reply-To` header from it — "By
 * default, we take `email` as the `replyto` address" — so capitalising it to
 * match its siblings would silently cost every reply. Do not tidy it. The
 * notification renders the row label from the `name`, so lowercase is the whole
 * price. See ENGINEERING.md §1.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CSS DECIDES WHICH BRANCH IS LIVE. THIS FILE ONLY ASKS IT, AND ONLY AT SUBMIT.
 * ─────────────────────────────────────────────────────────────────────────────
 * sections.css hides the inactive branches with `:has()`, and it owns that
 * alone — moving the display switch into React would break the form outright
 * with the bundle off, because the server render is committed to one branch and
 * clicking a radio would then change nothing at all.
 *
 * But `display: none` only hides a field; it does not take it out of the
 * submission. With CSS alone an "Ask a question" message also carried an empty
 * "Drop-off address", and every submission carried "Wants updates: yes" from a
 * checkbox two thirds of visitors never saw.
 *
 * The obvious fix is to render `disabled` on the hidden branch's fields, and it
 * is the wrong one. `disabled` is a rendered attribute, so it describes whatever
 * React last committed, while a submission is whatever the DOM says RIGHT NOW —
 * and those disagree every time a submit lands in the same tick as the radio
 * change, before React has re-rendered. Measured, not theorised: select "Ask a
 * question", type, and submit inside one tick, and `new FormData(form)` returns
 * no `Question` key at all. The visitor's message is silently dropped, and no
 * later filtering can put it back, because a filter can only delete. The same
 * attribute is also the only way to end up with a field that is on screen and
 * refuses to be typed in — which is what happens the moment React's idea of the
 * checked radio and the browser's diverge, or the stylesheet fails to arrive.
 *
 * So nothing here is ever `disabled`. Exclusion happens once, at submit, by
 * asking the browser which branches it is actually painting as `display: none`
 * and deleting those fields from the payload:
 *
 *     READ THE COMPUTED STYLE AT SUBMIT. NEVER CACHE THE ANSWER IN STATE.
 *
 * That is an observation of the real thing, taken at the only moment it matters,
 * so it cannot be stale and it cannot lose a field. It also needs no feature
 * test and no interlock, because it degrades correctly on its own:
 *
 *   · Stylesheet missing or blocked — a 404 on the hashed asset, Firefox's
 *     View ▸ Page Style ▸ No Style, a user stylesheet. Every branch computes to
 *     `block`, nothing is filtered, and every field the visitor can see is sent.
 *     An earlier draft gated on `CSS.supports('selector(:has(*))')`, which asks
 *     whether the engine can PARSE `:has()` and says nothing about whether the
 *     rules arrived; with the `<link>` removed it shipped two visible, disabled
 *     fields. See the corrections log in ENGINEERING.md §1.
 *   · No `:has()` support. The `@supports not` block opens all three branches,
 *     all three compute to `flex`, nothing is filtered. The measurement subsumes
 *     the feature test, which is why there is no feature test.
 *   · No JavaScript. Nothing runs, the browser posts natively, and every branch
 *     submits — exactly as before this change, which is the documented floor.
 *
 * Because CSS is the single authority, React holds no opinion about which radio
 * is checked. There is no mirrored `purpose` state to fall out of sync, so the
 * radios stay uncontrolled and carry no React event handlers at all: a click
 * that lands before the bundle does, or a browser restoring form state across a
 * reload without firing `change`, simply changes what the next measurement sees.
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
 * The native `action`, `method` and the hidden `redirect` input are untouched.
 * They are the no-JavaScript path, and they are also the failure path.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT HAPPENS WHEN THE FETCH DOES NOT COME BACK
 * ─────────────────────────────────────────────────────────────────────────────
 * One rule, applied in `send`:
 *
 *     KEEP THE REDIRECT ONLY WHEN WE ARE CONFIDENT NOTHING WAS DELIVERED.
 *
 * · No response at all — blocked, offline, DNS, CORS on the request itself.
 *   Nothing reached Web3Forms, so the native POST is a genuine first attempt and
 *   gets the full native behaviour, `redirect` included. No duplicate is
 *   possible, because nothing was sent.
 * · A response we could not accept — `success: false`, a non-2xx, an unreadable
 *   body. Web3Forms has answered, so we re-ask natively with the `redirect`
 *   input DISABLED. That matters: whether Web3Forms honours `redirect` on a
 *   rejection is undocumented, and landing someone on the campaign's own
 *   thank-you page for a message that was refused is the worst outcome
 *   available. Stripped, they see Web3Forms' real outcome page either way.
 * · Timed out. Ambiguous by definition — an abort cancels our read, not their
 *   processing — so it counts as "may have been delivered" and also drops the
 *   redirect. The budget is deliberately long (see SEND_TIMEOUT_MS); a short one
 *   turns a slow mobile connection into two emails as a matter of routine.
 *
 * The phase is reset to idle immediately before handing off, so a visitor who
 * presses Stop during the fallback navigation is left with a live form rather
 * than a button permanently reading "Sending…" — the one dead end a design with
 * no error UI cannot otherwise escape.
 *
 * ⚠ TURNSTILE CHANGES THIS. `cf-turnstile-response` is single-use, so once the
 * fetch has spent the token the native fallback carries a dead one and
 * Web3Forms will refuse it. The fallback therefore only rescues the no-response
 * case when Turnstile is on — which is the case it exists for. It also means
 * Turnstile all but removes the duplicate-delivery risk. Turnstile needs
 * JavaScript, so switching it on costs the no-JavaScript path entirely; that
 * trade is the campaign's, and it is recorded in HANDOFF.md.
 *
 * ⚠ Do NOT reach for `<form action={fn}>` / `useActionState` here, whatever
 * ENGINEERING.md §2.3 says. React 19 renders a function action as
 * `action="javascript:throw new Error(…)"` and drops `method` entirely, so the
 * form does nothing at all with JavaScript off.
 */

/** One endpoint for both paths. The fetch and the native `action` must agree. */
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'

/**
 * `fetch` has no timeout of its own, and a button stuck on "Sending…" forever
 * is worse than a plain POST. Long on purpose: a multipart POST from a phone on
 * a weak connection routinely takes tens of seconds, and every second shaved off
 * here buys a duplicate email rather than a faster answer, because giving up
 * cannot un-send what already arrived.
 */
const SEND_TIMEOUT_MS = 45000

/**
 * The branch suffix for each purpose — `purpose-join` → `join`. Derived rather
 * than written out, so `.form__branch--*` and `.form__submit-label--*` cannot
 * drift from PURPOSES.
 */
function branchKey(purposeId: string): string {
  return purposeId.replace('purpose-', '')
}

const BRANCH_KEYS: readonly string[] = PURPOSES.map((purpose) => branchKey(purpose.id))

/**
 * Drop every named control inside a branch the stylesheet is currently hiding.
 *
 * The one place branch suppression happens, and it reads the browser rather than
 * any cached state — see the note at the top of this file for why that is the
 * whole design and not an implementation detail. A branch whose element is
 * missing counts as visible, because "I could not find it" is not evidence that
 * it is hidden.
 *
 * Names come out of the DOM rather than a list here, so a field added to a
 * branch later is covered without touching this file. `delete` removes every
 * entry under a name, so no name may appear both inside and outside a branch.
 * None does, and none should — they are the labels the campaign reads.
 */
function dropHiddenBranchFields(form: HTMLFormElement, body: FormData): void {
  for (const key of BRANCH_KEYS) {
    const branch = form.querySelector(`.form__branch--${key}`)
    if (branch === null || getComputedStyle(branch).display !== 'none') continue
    for (const control of branch.querySelectorAll('[name]')) {
      const name = control.getAttribute('name')
      if (name !== null) body.delete(name)
    }
  }
}

/**
 * Hand the submission back to the browser, which is what it would have done
 * with no JavaScript at all.
 *
 * `submit()`, not `requestSubmit()`, which would re-fire the React handler.
 * Disabling the hidden `redirect` input is a direct DOM write under React on
 * purpose: it is a one-way door immediately followed by a navigation, and a
 * state update would not have flushed in time to matter.
 */
function fallBackToNativePost(form: HTMLFormElement, keepRedirect: boolean): void {
  if (!keepRedirect) {
    const redirect = form.querySelector<HTMLInputElement>('input[name="redirect"]')
    if (redirect !== null) redirect.disabled = true
  }
  try {
    form.submit()
  } catch {
    /* Nothing left to try. The phase is already back to idle, so the form is
       live and the visitor can press the button again. */
  }
}

/** `sent` is the moment between a confirmed send and the navigation. */
/**
 * `unverified` is a resting state, not a failure: nothing was sent and the
 * visitor only has to finish the check above. It behaves like `idle` for the
 * button and the abort logic, so `busy` deliberately excludes it.
 */
type Phase = 'idle' | 'sending' | 'sent' | 'unverified'

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
  /**
   * A send is in flight. A ref, not the `phase` state below, because this has to
   * be true the instant the handler runs: state updates are asynchronous, so
   * three fast presses all read the same stale `idle` and fire three requests.
   * Measured — it sent three. `phase` describes the button; this guards the send.
   */
  const sendingRef = useRef(false)
  /**
   * Which send is current. Bumped on every submit and on a bfcache restore, so a
   * continuation that was frozen mid-flight and thaws later cannot navigate the
   * visitor away or resubmit under them.
   */
  const attemptRef = useRef(0)
  /** The document is going away; a rejected fetch must not hijack that. */
  const unloadingRef = useRef(false)
  const abortRef = useRef<AbortController | null>(null)

  /* A constant, never a measurement: the first client render has to reproduce
     the server's markup exactly (entry-client.tsx). */
  const [phase, setPhase] = useState<Phase>('idle')

  /*
   * Synchronises with the page lifecycle. Returning from the thank-you page
   * restores this document with its JavaScript heap frozen mid-send, and re-runs
   * no effect: without this the visitor comes back to a button that reads
   * "Sending…" forever. Bumping the attempt retires the frozen continuation at
   * the same time, so it cannot resubmit or navigate when it finally settles.
   */
  useEffect(() => {
    const onPageHide = () => {
      unloadingRef.current = true
    }
    const onPageShow = (event: PageTransitionEvent) => {
      unloadingRef.current = false
      if (!event.persisted) return
      attemptRef.current += 1
      abortRef.current?.abort()
      abortRef.current = null
      sendingRef.current = false
      setPhase('idle')
    }
    window.addEventListener('pagehide', onPageHide)
    window.addEventListener('pageshow', onPageShow)
    return () => {
      window.removeEventListener('pagehide', onPageHide)
      window.removeEventListener('pageshow', onPageShow)
    }
  }, [])

  const send = async (form: HTMLFormElement) => {
    const attempt = attemptRef.current
    const controller = new AbortController()
    abortRef.current = controller
    const timer = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS)
    /** Did Web3Forms answer at all? The fallback rule turns on this. */
    let responded = false

    try {
      const body = new FormData(form)
      /*
       * `redirect` is what makes Web3Forms answer with a 3xx instead of JSON —
       * the vendor's own troubleshooting says to strip it from a JavaScript
       * submission. From the copy only: the hidden input stays in the DOM, where
       * it is the entire no-JavaScript thank-you page.
       */
      body.delete('redirect')
      dropHiddenBranchFields(form, body)

      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        /* No Content-Type: the browser has to write the multipart boundary.
           Multipart and Accept are both CORS-safelisted, so this stays a simple
           request with no preflight. Sending urlencoded would come back as a
           redirect rather than JSON — the vendor says so explicitly. That
           warning is about READING the answer, which is why the native POST is
           untouched: a navigation wants the redirect. */
        headers: { Accept: 'application/json' },
        body,
        signal: controller.signal,
      })
      responded = true

      const result = (await response.json()) as { success?: boolean }
      /* `response.ok` is not enough. A rejected key, an unapproved domain or a
         spam flag is a reply, not a network failure. */
      if (!response.ok || result.success !== true) {
        throw new Error('Web3Forms rejected the submission')
      }
    } catch {
      if (unloadingRef.current || attemptRef.current !== attempt) return
      /* Idle first: if the navigation below happens the page is discarded and
         this never renders, and if it is cancelled the visitor gets a working
         form instead of a dead one. */
      sendingRef.current = false
      setPhase('idle')
      fallBackToNativePost(form, !responded && !controller.signal.aborted)
      return
    } finally {
      clearTimeout(timer)
      if (abortRef.current === controller) abortRef.current = null
    }

    /* Outside the try, so nothing here can be mistaken for a send failure and
       resubmit a message that was already delivered. */
    if (attemptRef.current !== attempt) return
    setPhase('sent')
    window.location.assign(href(base, 'thanks/'))
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (sendingRef.current) return
    /* React nulls `currentTarget` the moment dispatch ends, so read it now. */
    const form = event.currentTarget

    /*
     * Refuse to send without a Turnstile token.
     *
     * Web3Forms rejects an unverified submission anyway, but only after a round
     * trip — so the visitor fills the form, presses the button, waits, and is
     * told it failed for a reason the page never mentioned. Checking here turns
     * that into "finish the check above" before anything is sent.
     *
     * The widget writes `cf-turnstile-response` into the form itself, so the
     * form data is the authoritative source: no token means unsolved, expired,
     * or the widget never loaded. It is not security — a browser can be made to
     * send anything, which is exactly why the secret key still verifies this
     * server-side at Web3Forms. It is honesty about what is about to happen.
     */
    if (turnstileSiteKey !== null) {
      const token = new FormData(form).get('cf-turnstile-response')
      if (typeof token !== 'string' || token === '') {
        setPhase('unverified')
        return
      }
    }

    sendingRef.current = true
    attemptRef.current += 1
    setPhase('sending')
    void send(form)
  }

  const busy = phase === 'sending' || phase === 'sent'

  return (
    <section className="form-wrap container">
      <form
        className="card form"
        id="involved-form"
        action={WEB3FORMS_ENDPOINT}
        method="POST"
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

          It sits outside every `.form__branch`, so the payload filter leaves it
          alone — as it must, since an unticked box contributes nothing and a
          ticked one is the whole signal.
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
        {/* `email`, lowercase, is a Web3Forms reserved name: it is what sets the
            `Reply-To` header, and it is the only field here not named for the
            inbox. The visible label is FORM.email.label and is unaffected. */}
        <TextField
          id="email"
          name="email"
          type="email"
          label={FORM.email.label}
          placeholder={FORM.email.placeholder}
          autoComplete="email"
          required
        />

        {/*
          The three branches. Which one is visible is decided entirely by
          sections.css; which one is SENT is decided by reading that back in
          `dropHiddenBranchFields` at submit. Nothing here is ever `disabled` —
          see the note at the top of this file, and do not add it back.

          Every control inside a branch must carry a `name`, or it will not be
          filtered when its branch is hidden.
        */}
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
            <Photo {...imgSources(base, IMAGES.yardSign)} image={IMAGES.yardSign} />
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
          {phase === 'sending'
            ? FORM.status.announcing
            : phase === 'sent'
              ? FORM.status.sentAnnouncement
              : ''}
        </p>

        {turnstileSiteKey === null ? null : (
          /*
           * Cloudflare Turnstile. The widget writes a `cf-turnstile-response`
           * field into the form, and Web3Forms rejects the submission if that
           * token is missing or already spent — the verification happens there,
           * against the secret key in their dashboard, never here.
           *
           * It sits outside every `.form__branch`, so the payload filter never
           * touches it. It needs JavaScript, so with the bundle blocked there is
           * no token and Web3Forms turns the submission away. That is the cost
           * of switching it on: the form stops being usable without JavaScript.
           * The honeypot above still works either way.
           */
          <>
            <Turnstile siteKey={turnstileSiteKey} />
            {phase === 'unverified' ? (
              <p className="form__error" role="alert">
                {FORM.status.unverified}
              </p>
            ) : null}
          </>
        )}

        <SubmitButton variant="accent" size="lg" busy={busy}>
          {phase === 'sending' ? (
            FORM.status.sending
          ) : phase === 'sent' ? (
            FORM.status.sent
          ) : (
            /* Three labels, one shown at a time by the same `:has()` rules that
               switch the branches. CSS, so it survives with the bundle off. */
            PURPOSES.map((purpose) => (
              <span
                key={purpose.id}
                className={`form__submit-label form__submit-label--${branchKey(purpose.id)}`}
              >
                {purpose.submitLabel}
              </span>
            ))
          )}
        </SubmitButton>
        <p className="note">{FORM.privacy}</p>
        <DonateRow />
      </form>
    </section>
  )
}
