# Handoff: the captcha

Written 2026-08-10; substantially revised later the same day. Read `HANDOFF.md`
first for the project as a whole; this covers one thread.

**Goal.** Stop bot spam reaching the campaign's Web3Forms inbox, on the free
plan, without breaking the contact form.

**Status.** **Root cause found and fixed.** It was one stray form field, and it
had nothing to do with the plan, the site key, or the transport. Awaiting one
confirming submission in a browser.

**Escape hatch, unchanged.** If the form must work before anyone can test it,
unset `HCAPTCHA_SITE_KEY` in the Cloudflare build variables and trigger a
build — the widget and its script vanish, the submit guard goes dormant, and
the form posts as it did before any of this. The honeypot and Web3Forms'
Advanced Spam Filter still run.

---

## The bug

**The hCaptcha widget injects two textareas, and one of them makes Web3Forms
think you are using reCaptcha.**

hCaptcha is designed as a drop-in replacement for reCAPTCHA, so alongside
`h-captcha-response` it writes an empty `g-recaptcha-response` for servers that
only know the old name. Measured on the deployed page — both are present, every
time, before anything is solved:

```
{ "name": "g-recaptcha-response", "tag": "textarea", "value": "" }
{ "name": "h-captcha-response",  "tag": "textarea", "value": "" }
```

Their docs do not mention this. It was found by enumerating the live form's
fields, not by reading.

Web3Forms decides which captcha you are using from which field arrives.
`g-recaptcha-response` puts the submission on the reCaptcha path, reCaptcha is
Pro, and it is refused with

> You are trying to use a Pro feature, Please Upgrade to use reCaptcha.

before the valid hCaptcha token sitting next to it is ever looked at. Presence
alone is enough — the field is empty and it still triggers this.

**The fix is one line** in `ContactForm`'s send path, next to the existing
`body.delete('redirect')`:

```js
body.delete('g-recaptcha-response')
```

Two things worth keeping in mind about how this presented:

- **The error names a plan problem and is not one.** hCaptcha is free on
  Web3Forms; nothing needed upgrading. Anyone reading that message at face value
  goes looking at billing, which is where this thread nearly went.
- **It was never the transport or the key.** The multipart-to-JSON change and
  the site-key correction were both right on their own merits, and neither was
  the fix. This field was being sent the whole time, under every attempt.

---

## The thing that was actually wrong

**Every error message this thread was diagnosed from belonged to a different
request than the one that failed.**

None of `You are trying to use a Pro feature`, `Could not validate hCaptcha` or
`Form submission failed!` is a string in this repo — grep for them and you get
nothing. They are Web3Forms' own error *page*. The visitor only ever reached
that page because when the `fetch` failed, `fallBackToNativePost` re-submitted
the form natively, which is a real navigation to `api.web3forms.com`.

And that second request could never succeed. `h-captcha-response` is redeemed
by Web3Forms when it verifies, so the native re-POST always carried a **spent
token**. It was refused on that ground regardless of what went wrong the first
time, and the message it produced then got read as the diagnosis of the first
failure.

So: three diagnoses drawn from a message that was, structurally, always going to
say "rejected" — and the first request's real answer was never seen once. The
"nobody has looked at the actual HTTP exchange" gap in the original handoff was
correct, but understated. It was worse than missing data; it was confidently
wrong data.

---

## What was fixed

**1. The AJAX submission is now JSON, not multipart.** Web3Forms states this as
a requirement, not a preference:

> For Javascript usage, you must serialize the data and include `Content-Type`
> headers as `application/json`

Every multipart example in their documentation is for file attachments, which
this form has none of. The old code sent the `FormData` object directly to skip
the CORS preflight that `application/json` forces — a saved round trip traded
against a documented requirement, on a path `HANDOFF.md` itself flags as the
single unproven assumption in the whole design. It was never once confirmed to
work. The native POST is untouched and still urlencoded, which is correct: the
vendor's warning about urlencoded concerns the answer arriving as a redirect,
and a native navigation *wants* the redirect.

**2. With a captcha on, there is no native fallback at all.** A failure now
stays on the page, says what happened, re-arms the widget, and lets the visitor
press send again. The no-response case is not an exception, though it is the
tempting one: "no response" does not mean "not delivered" — an opaque CORS
failure looks identical to a request that arrived and was processed — so a
native retry there risks a dead token *and* a duplicate email, which is exactly
what the file's existing fallback rule exists to prevent. With no captcha
configured the original behaviour is untouched, because there it is still right.

**3. The real error is surfaced.** Web3Forms' `message` is read off the response
and shown, in three distinct shapes: refused (with their words quoted), nothing
came back, and answered-but-unreadable. Those are three different pieces of
advice for the visitor, and — bluntly — the only error reporting this
integration has ever had. The underlying error also goes to `console.error`,
which is where the next person testing against the live API will find
`TypeError: Failed to fetch` versus an actual refusal.

**4. The widget is re-armed on every failure, and on expiry.** Tokens are
single-use and expire in roughly two minutes. Previously the only recovery was a
full page reload, which no visitor will think to do; they would press send
twice, see the same error, and leave. `expired-callback` and
`chalexpired-callback` are now wired too, so someone writing a long message does
not arrive at the button with a dead token and no visible sign of it.

---

## What is verified, and how

`scripts/prerender.mjs` output was served, the hCaptcha widget and `fetch` were
stubbed, and the **real built bundle** was driven in headless Chrome over CDP —
five scenarios, each from a fresh page load.

| Scenario | Result |
|---|---|
| Server refuses with a message | Stays on page; shows *That didn't send. The form service said: "…"*; widget reset; **0 native submits** |
| Network failure (`fetch` rejects) | Stays on page; "nothing came back" copy; widget reset; 0 native submits |
| Answers, but unreadable JSON | Stays on page; "didn't say why" copy; widget reset; 0 native submits |
| Success | Navigates to `/thanks/` |
| No token | Blocked before any request — `fetchCount: 0` — "finish the security check above" |

In all failing cases: exactly **one** request (no double-send), the response
field left empty afterwards so the next press hits the guard, and the message
carried on `role="alert"`.

**Hypothesis 1 from the original handoff is disproved, by measurement.** The
sent payload keys were:

```
access_key, subject, from_name, Reason, First name, Last name, email,
Question, h-captcha-response
```

`h-captcha-response` survives into the body, non-empty. `dropHiddenBranchFields`
still works through the JSON conversion — `Question` present, `Drop-off address`
and `Wants updates` correctly absent for the question branch. `body.delete` was
never touching the token, because the widget's container is a direct child of
the form and not inside any `.form__branch--*`.

Also still true from the original handoff, and re-confirmed: the site key
`50b2fe65-b00b-4b9e-ad62-3ba471098be2` is Web3Forms' own published free-plan
key, and bringing your own pair is a paid feature. Their docs explicitly support
loading `js.hcaptcha.com` directly with it rather than their proxy script, which
is what this does.

**A note for whoever tries to test this from a terminal: you cannot.**
`api.web3forms.com` sits behind a Cloudflare managed challenge — a plain `curl`
comes back `HTTP 403` with `cf-mitigated: challenge` and an interstitial page,
whatever headers you send. This is now measured, not assumed, and it is why
there is no CI smoke test for the form.

---

## What is left

**One confirming submission.** Load `/involved/` fresh, solve the captcha, send.
Expect to land on `/thanks/` with the email arriving. Fold the remaining
`WEB3FORMS_KEY` checks in `HANDOFF.md` §1 into the same sitting — both branch
paths, and the `Reply-To` pass/fail.

If it still fails, the page now quotes the reason. Two readings worth knowing:

- *"Could not validate hCaptcha"* — the token itself is being rejected. The
  payload shape is right, so suspect their dashboard state, not this code.
- *A network error with nothing quoted* — the request never got an answer.
  Suspect the Cloudflare challenge in front of their API being applied to a
  cross-origin `fetch`, which no client code can solve. That would make the
  Worker in `HANDOFF.md` the fix.

**A note on the test harness.** The headless suite described above stubbed the
widget with only `h-captcha-response`, so it reproduced a friendlier form than
the real one and sailed past the actual bug. The stub now injects both fields.
The general lesson, which this thread has now paid for twice: a stub that is
kinder than production tests the stub.

---

## How the integration is put together

- `src/components/ui/HCaptcha.tsx` — renders explicitly via
  `window.hcaptcha.render()` from an effect, not via the documented
  `<div class="h-captcha" data-captcha="true">` auto-scan. Exposes a `reset()`
  handle and wires both expiry callbacks.

  **Do not "fix" this back to the documented approach.** The auto-scan races
  hydration and React reconciles away children of a container it rendered
  empty, so the widget disappears on the first re-render — and this form
  re-renders on every phase change. Web3Forms' own React guidance also sets the
  token manually. The field the server reads is the same either way.

- `src/components/sections/InvolvedForm.tsx` — `ContactForm` holds the phase
  machine, the abort/timeout handling, `dropHiddenBranchFields()`,
  `toJsonPayload()`, the submit guard, and the failure copy. The docblock
  explains each; it is long because every paragraph in it is a bug someone
  already shipped.

- `scripts/prerender.mjs` — reads `HCAPTCHA_SITE_KEY`, emits the script tag when
  set, threads the key through `page-data` to the client.

- `src/content/involved.ts` — `FORM.status.failed*`, the visitor-facing copy.

- Config: `HCAPTCHA_SITE_KEY` is a **build** variable in Cloudflare. Nothing
  goes in the Web3Forms dashboard beyond selecting hCaptcha. The campaign's own
  hCaptcha account is not used and can be ignored unless they upgrade.

---

## The larger point, unchanged

Even fully working, this only stops bots that load the page. `WEB3FORMS_KEY` is
baked into the public HTML, so a bot can POST straight to `api.web3forms.com`
and skip every client-side check. The Worker specced at the end of `HANDOFF.md`
is what actually closes that, by moving the access key server-side and verifying
the captcha before relaying. If the browser test above comes back with a network
error rather than a refusal, build the Worker instead of pushing further here —
it solves the real problem rather than the visible one.
