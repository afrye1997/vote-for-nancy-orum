import type { ReactNode } from 'react'

/**
 * The design system's button, as two small components instead of one with a
 * `href`-or-`onClick` union. A link and a submit control are different elements
 * with different semantics; collapsing them behind one prop bag is how sites
 * end up shipping `<div onClick>` that keyboards cannot reach.
 *
 * Zero domain knowledge lives here (ENGINEERING.md §3): these do not know what
 * a donation is, only that a submission can be in flight.
 *
 * There was a third, `DisabledButton`, for a control the page showed but could
 * not yet make work. Its only caller was `DonateRow`, which now renders a real
 * link for that case and argues in its own note why a dimmed control was the
 * wrong answer. The `aria-disabled` reasoning it carried is folded into
 * `SubmitButton` below, which is the one place still using it.
 */

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'inverse'
export type ButtonSize = 'sm' | 'md' | 'lg'

type Style = {
  readonly variant?: ButtonVariant
  readonly size?: ButtonSize
}

function classes({ variant = 'primary', size = 'md' }: Style): string {
  return size === 'md' ? `btn btn--${variant}` : `btn btn--${variant} btn--${size}`
}

export function LinkButton({
  href,
  external = false,
  children,
  ...style
}: Style & {
  readonly href: string
  /** Opens in a new tab. Only for destinations we do not control. */
  readonly external?: boolean
  readonly children: ReactNode
}) {
  const target = external ? { target: '_blank', rel: 'noopener noreferrer' } : {}
  return (
    <a className={classes(style)} href={href} {...target}>
      {children}
    </a>
  )
}

export function SubmitButton({
  children,
  busy = false,
  ...style
}: Style & {
  readonly children: ReactNode
  /**
   * A submission is in flight. `aria-disabled` rather than `disabled`, for two
   * reasons:
   *
   *   · A truly disabled control is skipped by a screen reader, so the state a
   *     sighted visitor can see would go unannounced. `aria-disabled` keeps it
   *     in the tab order and reachable.
   *   · `disabled` on the element that currently holds focus drops focus to
   *     `<body>`, so someone who pressed Enter loses their place at the moment
   *     they most need telling what is happening.
   *
   * The attribute does not stop a second activation — the form's own submit
   * handler does.
   */
  readonly busy?: boolean
}) {
  return (
    <button
      className={classes(style)}
      type="submit"
      aria-disabled={busy ? 'true' : undefined}
      data-busy={busy ? '' : undefined}
    >
      {children}
    </button>
  )
}
