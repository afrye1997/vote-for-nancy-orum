import { useEffect, useRef } from 'react'

/**
 * Cloudflare Turnstile, rendered explicitly.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY NOT THE `cf-turnstile` CLASS
 * ─────────────────────────────────────────────────────────────────────────────
 * Turnstile's script auto-scans the document for `.cf-turnstile` on load and
 * injects an iframe into whatever it finds. That is the documented happy path
 * and it does not work inside a hydrating React tree:
 *
 * - The script is `async defer` and the module bundle loads independently, so
 *   the scan and hydration race. Lose the race and Turnstile injects into a div
 *   that React is about to reconcile.
 * - React hydrating an element it rendered as empty, and finding an iframe in
 *   it, is a mismatch — and on any later re-render React owns those children.
 *   The form re-renders on every phase change, which is exactly when the widget
 *   would vanish.
 *
 * Rendering explicitly from an effect happens strictly after hydration, and the
 * container stays childless as far as React is concerned — it renders an empty
 * div once and never diffs into it again, so nothing it does can remove the
 * iframe.
 *
 * The widget writes `cf-turnstile-response` into the enclosing form either way,
 * which is what the submit handler checks and what Web3Forms verifies against
 * the secret key. Nothing here is a security boundary.
 */

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string | undefined
  remove: (id: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

export function Turnstile({ siteKey }: { readonly siteKey: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let widgetId: string | undefined
    let cancelled = false
    let poll: ReturnType<typeof setInterval> | undefined

    const render = () => {
      const el = ref.current
      if (cancelled || !el || !window.turnstile) return
      /* Belt and braces: a hot reload can leave the previous iframe behind. */
      el.replaceChildren()
      widgetId = window.turnstile.render(el, { sitekey: siteKey, theme: 'light' })
    }

    if (window.turnstile) {
      render()
    } else {
      /*
       * The script is `async defer`, so it may not have run yet. Polling rather
       * than the `onload=` query parameter, which needs a global function name
       * and would have to be installed before the script tag in the document —
       * that is prerender.mjs's business, and this keeps it out of there.
       */
      poll = setInterval(() => {
        if (!window.turnstile) return
        clearInterval(poll)
        render()
      }, 100)
    }

    return () => {
      cancelled = true
      if (poll) clearInterval(poll)
      if (widgetId) window.turnstile?.remove(widgetId)
    }
  }, [siteKey])

  return <div ref={ref} />
}
