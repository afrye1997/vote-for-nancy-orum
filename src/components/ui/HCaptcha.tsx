import { useEffect, useRef } from 'react'

/**
 * hCaptcha, rendered explicitly.
 *
 * Replaces Turnstile, which Web3Forms only verifies on their Pro plan — a
 * free-tier submission carrying a Turnstile token is rejected outright.
 * hCaptcha is on the free plan, and the integration is otherwise identical:
 * the widget writes `h-captcha-response` into the enclosing form, and
 * Web3Forms checks it against the secret key in their dashboard.
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

export function HCaptcha({ siteKey }: { readonly siteKey: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let widgetId: string | undefined
    let cancelled = false
    let poll: ReturnType<typeof setInterval> | undefined

    const render = () => {
      const el = ref.current
      if (cancelled || !el || !window.hcaptcha) return
      /* A hot reload can leave the previous iframe behind. */
      el.replaceChildren()
      widgetId = window.hcaptcha.render(el, { sitekey: siteKey, theme: 'light' })
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
      if (widgetId === undefined) return
      const api = window.hcaptcha
      if (api?.remove) api.remove(widgetId)
      else api?.reset?.(widgetId)
    }
  }, [siteKey])

  return <div ref={ref} />
}
