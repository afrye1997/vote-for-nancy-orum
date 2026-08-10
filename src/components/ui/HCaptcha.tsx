import { useEffect, useImperativeHandle, useRef, type Ref } from 'react'

/**
 * hCaptcha, rendered explicitly.
 *
 * Replaces Turnstile, which Web3Forms only verifies on their Pro plan — a
 * free-tier submission carrying a Turnstile token is rejected outright.
 * hCaptcha is on the free plan: the widget writes `h-captcha-response` into the
 * enclosing form and Web3Forms verifies it server-side.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE SITE KEY IS WEB3FORMS', NOT OURS
 * ─────────────────────────────────────────────────────────────────────────────
 * On the free plan Web3Forms supplies the hCaptcha site key and holds the
 * matching secret — their docs publish it as
 * 50b2fe65-b00b-4b9e-ad62-3ba471098be2. Bringing your own key/secret pair is a
 * paid feature, and a token minted against a different site key will not
 * verify against their secret. So HCAPTCHA_SITE_KEY is set to their published
 * value, not to a key from an hCaptcha account of ours.
 *
 * Hostname allow-listing is therefore theirs to manage, which is why no
 * hostname configuration exists on our side.
 *
 * Their documented integration loads `web3forms.com/client/script.js` and lets
 * it auto-render into `<div class="h-captcha" data-captcha="true">`. That is
 * the auto-scan pattern described below, and it is exactly what does not
 * survive hydration — their own React guidance says to set the token manually
 * instead, which is the shape used here. The field the server reads is the
 * same either way.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY EXPLICIT RENDER, NOT THE `h-captcha` CLASS
 * ─────────────────────────────────────────────────────────────────────────────
 * Exactly the reason Turnstile needed it. hCaptcha's script auto-scans for
 * `.h-captcha` on load and injects an iframe, which does not survive a
 * hydrating React tree: the script and the module bundle load independently so
 * the scan races hydration, and once React owns a container it rendered as
 * empty, any later re-render reconciles those children away. This form
 * re-renders on every phase change.
 *
 * Rendering from an effect runs strictly after hydration, and the container
 * stays childless as far as React is concerned, so nothing React does can
 * remove the iframe. The script is loaded with `render=explicit` so the
 * auto-scan never competes with this.
 *
 * None of this is a security boundary — a browser can send whatever it likes.
 * The check that matters is Web3Forms verifying the token server-side.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * A TOKEN IS SINGLE-USE AND SHORT-LIVED, SO THE WIDGET MUST BE RE-ARMABLE
 * ─────────────────────────────────────────────────────────────────────────────
 * Two ways the token in the form goes stale without the visitor doing anything
 * wrong, and both used to strand them with no recovery but a page reload:
 *
 *   · Spent. Web3Forms redeems the token when it verifies, so the SECOND send
 *     of one token always fails however good it was. Any failed submit must
 *     therefore re-arm the widget, or every retry on that page load re-sends a
 *     token that is already dead — which reads as "the form is broken" when the
 *     original failure may have been a dropped connection.
 *   · Expired. hCaptcha ages a token out after roughly two minutes, so someone
 *     writing a long question can arrive at the send button with nothing valid
 *     in the form.
 *
 * Hence `reset` on the handle, and the expiry callbacks below. hCaptcha clears
 * its own response field on expiry, so the form's pre-send guard already
 * catches that case; resetting as well is what makes the widget visibly ask
 * again instead of sitting there looking solved.
 */

type HCaptchaApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string | undefined
  remove?: (id: string) => void
  reset?: (id: string) => void
}

declare global {
  interface Window {
    hcaptcha?: HCaptchaApi
  }
}

export type HCaptchaHandle = {
  /** Discard the current token and ask the visitor again. Safe to call anytime. */
  reset: () => void
}

/**
 * Re-arm a widget, if there is one and hCaptcha still recognises it.
 *
 * Best-effort by design, and shared by both callers below so neither can get
 * the guards subtly different. hCaptcha throws on a widget id it no longer
 * knows — after its script reloads, say — and a form that cannot re-arm its
 * captcha is still a form; one that threw during an event handler may not be.
 */
function resetWidget(widgetId: string | undefined): void {
  if (widgetId === undefined) return
  try {
    window.hcaptcha?.reset?.(widgetId)
  } catch {
    /* Nothing to do here: reloading the page still recovers. */
  }
}

export function HCaptcha({
  siteKey,
  ref,
}: {
  readonly siteKey: string
  /** React 19 passes `ref` as an ordinary prop — no `forwardRef` needed. */
  readonly ref?: Ref<HCaptchaHandle>
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  /* Outside the effect because the parent reaches for it through the handle,
     and the effect's closure is not reachable from there. */
  const widgetRef = useRef<string | undefined>(undefined)

  useImperativeHandle(ref, () => ({ reset: () => resetWidget(widgetRef.current) }), [])

  useEffect(() => {
    let cancelled = false
    let poll: ReturnType<typeof setInterval> | undefined

    const render = () => {
      const el = containerRef.current
      if (cancelled || !el || !window.hcaptcha) return
      /* A hot reload can leave the previous iframe behind. */
      el.replaceChildren()
      widgetRef.current = window.hcaptcha.render(el, {
        sitekey: siteKey,
        theme: 'light',
        /* Both expiries clear the response field; resetting makes the widget
           show an unsolved checkbox again rather than a stale solved one. */
        'expired-callback': () => resetWidget(widgetRef.current),
        'chalexpired-callback': () => resetWidget(widgetRef.current),
      })
    }

    if (window.hcaptcha) {
      render()
    } else {
      /* The script is `async defer`, so it may not have run yet. Polling rather
         than the `onload=` parameter, which needs a global function installed
         before the script tag — that would be prerender.mjs's business. */
      poll = setInterval(() => {
        if (!window.hcaptcha) return
        clearInterval(poll)
        render()
      }, 100)
    }

    return () => {
      cancelled = true
      if (poll) clearInterval(poll)
      /* `remove` is the newer API; `reset` is the one that has always existed.
         Neither is worth crashing an unmount over. */
      const widgetId = widgetRef.current
      if (widgetId === undefined) return
      widgetRef.current = undefined
      try {
        const api = window.hcaptcha
        if (api?.remove) api.remove(widgetId)
        else api?.reset?.(widgetId)
      } catch {
        /* Unmounting anyway. */
      }
    }
  }, [siteKey])

  return <div ref={containerRef} />
}
