# Handoff: the captcha, and why it still does not work

Written 2026-08-10 at the end of a long session. Read `HANDOFF.md` first for the
project as a whole; this covers one unfinished thread.

**Goal.** Stop bot spam reaching the campaign's Web3Forms inbox, on the free
plan, without breaking the contact form.

**Status.** Not working. Submissions fail. If the form needs to work before this
is solved, unset `HCAPTCHA_SITE_KEY` in the Cloudflare build variables and
trigger a build — the widget and its script vanish, the submit guard goes
dormant, and the form posts as it did before any of this. The honeypot and
Web3Forms' own Advanced Spam Filter still run.

---

## What was tried, in order

**1. Cloudflare Turnstile.** Built, deployed, widget rendered. Submitting
returned:

> You are trying to use a Pro feature, Please Upgrade to use Turnstile Captcha.

Web3Forms verifies Turnstile only on Pro. Dead end on the free plan.

**2. hCaptcha with the campaign's own hCaptcha account.** Their pricing page
lists "hCaptcha Integration" under the free plan, so the code was swapped over
and an hCaptcha account was created for a site key and secret. Submitting
returned:

> Could not validate hCaptcha. Please try later

**3. hCaptcha with Web3Forms' own site key.** Reading their docs
(`docs.web3forms.com/getting-started/customizations/spam-protection/hcaptcha`)
showed that on the free plan **Web3Forms supplies the site key and holds the
matching secret** — `50b2fe65-b00b-4b9e-ad62-3ba471098be2`. Bringing your own
pair is a paid feature, so a token minted against the campaign's own site key
could never verify against Web3Forms' secret. That explained failure 2.

Switched to their published key. Now returns:

> Form submission failed!

which is the generic message, with no detail. **This is where it stands.**

---

## What is verified, and how

Checked against the deployed page, not the local build:

- `HCAPTCHA_SITE_KEY` reaches the browser correctly. `page-data` on
  `/involved/` contains `"hcaptchaSiteKey":"50b2fe65-b00b-4b9e-ad62-3ba471098be2"`.
- The hCaptcha script is present, loaded with `render=explicit`.
- `access_key` is present, so `WEB3FORMS_KEY` is still configured.
- Zero Turnstile references remain.
- The Cloudflare build picks up dashboard build variables correctly.

Web3Forms dashboard (screenshot confirmed): Captcha Protection = hCaptcha,
Advanced Spam Filter on, Spam Protection Level Basic. **There are no custom
key/secret fields on the free plan**, so there is nothing there to misconfigure.
"Restrict to Domains" is a Pro feature and is empty.

**Not verified, and this is the gap:** nobody has looked at the actual HTTP
exchange. Every diagnosis so far came from the message rendered in the UI.

---

## Leading hypotheses, most likely first

**1. `h-captcha-response` may not survive into the POST body.**

`ContactForm`'s submit path builds `new FormData(form)` and then mutates it —
`body.delete('redirect')`, plus `dropHiddenBranchFields()` which strips fields
belonging to unselected radio branches. The hCaptcha token is a hidden
`<textarea name="h-captcha-response">` that the widget injects into its
container, and nobody has confirmed it is still in the body at the moment of
sending.

Note the submit *guard* reads the token from a **separate** `new FormData(form)`
and passes — so the token exists in the form. That does not prove it exists in
the body that is actually sent.

**2. Content type.** We send `FormData`, which goes as `multipart/form-data`.
Web3Forms' AJAX examples use `JSON.stringify` with
`Content-Type: application/json`. Multipart worked for submissions *before* the
captcha was added, so it is not broken in general — but their captcha
validation path may expect JSON. Worth testing a JSON submission.

**3. Token reuse.** hCaptcha tokens are single-use, and the widget is never
reset after a failed submit, so every retry on the same page load resends a
dead token. This is definitely a real defect (see below) and may have caused
some of the observed failures, but it does not explain a failure on a genuinely
fresh page load.

---

## Do this first

Open DevTools → Network, submit once from a freshly loaded page, and inspect
the request to `api.web3forms.com/submit`:

- **Is `h-captcha-response` in the request payload, and non-empty?**
  If no → hypothesis 1, and the fix is in how the body is assembled.
  If yes → the token is being rejected, so try hypothesis 2.
- **What is in the JSON response body?** Web3Forms returns a `message` field
  more specific than the UI shows.

That single observation splits the remaining possibilities in half. Everything
before this point was inference from UI strings, which is how three wrong
diagnoses happened in a row.

---

## Defects to fix regardless of the cause

**Surface the real error.** The form renders a generic failure string and
discards the `message` Web3Forms returns. That is why diagnosis has been so
slow, and it is bad for visitors too — they get "failed" with no idea whether
to retry, fix something, or give up. Show what the server said.

**Reset the widget after a failed submit.** Tokens are single-use. After any
failure the widget must be reset so a retry mints a fresh one; today the only
recovery is a full page reload, which no visitor will think to do. They will
press send twice, see the same error, and leave.

**Handle token expiry.** hCaptcha tokens expire after roughly two minutes.
Someone filling a long form slowly can have a dead token before they ever press
send. `expired-callback` should clear the stored token and prompt again.

---

## How the integration is put together

- `src/components/ui/HCaptcha.tsx` — renders explicitly via
  `window.hcaptcha.render()` from an effect, not via the documented
  `<div class="h-captcha" data-captcha="true">` auto-scan.

  **Do not "fix" this back to the documented approach.** The auto-scan races
  hydration and React reconciles away children of a container it rendered
  empty, so the widget disappears on the first re-render — and this form
  re-renders on every phase change. Web3Forms' own React guidance also sets the
  token manually. The field the server reads is the same either way.

- `src/components/sections/InvolvedForm.tsx` — `ContactForm` holds the phase
  machine, the abort/timeout handling, `dropHiddenBranchFields()`, and the
  submit guard that refuses to send with no token.

- `scripts/prerender.mjs` — reads `HCAPTCHA_SITE_KEY`, emits the script tag when
  set, threads the key through `page-data` to the client.

- Config: `HCAPTCHA_SITE_KEY` is a **build** variable in Cloudflare. Nothing
  goes in the Web3Forms dashboard beyond selecting hCaptcha. The campaign's own
  hCaptcha account is not used and can be ignored unless they upgrade.

---

## The larger point

Even solved, this only stops bots that load the page. `WEB3FORMS_KEY` is baked
into the public HTML, so a bot can POST straight to `api.web3forms.com` and skip
every client-side check. The Worker specced at the end of `HANDOFF.md` is what
actually closes that, by moving the access key server-side and verifying the
captcha before relaying. If this thread stays painful, building that instead is
the better use of the time — it solves the real problem rather than the visible
one.
