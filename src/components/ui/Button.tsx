import type { ReactNode } from 'react'

/**
 * The design system's button, as three small components instead of one with a
 * `href`-or-`onClick` union. A link and a submit control are different elements
 * with different semantics; collapsing them behind one prop bag is how sites
 * end up shipping `<div onClick>` that keyboards cannot reach.
 *
 * Zero domain knowledge lives here (ENGINEERING.md §3): these do not know what
 * a donation is, only that a button can be disabled.
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
  ...style
}: Style & {
  readonly children: ReactNode
}) {
  return (
    <button className={classes(style)} type="submit">
      {children}
    </button>
  )
}

/**
 * A control the page deliberately shows but cannot yet make work.
 *
 * `aria-disabled` rather than `disabled`, so it stays in the tab order and a
 * screen-reader user discovers the same "not yet" the sighted visitor sees —
 * a truly disabled button is silently skipped. `describedBy` points at the
 * visible sentence explaining why.
 */
export function DisabledButton({
  children,
  describedBy,
  ...style
}: Style & {
  readonly children: ReactNode
  readonly describedBy: string
}) {
  return (
    <button className={classes(style)} type="button" aria-disabled="true" aria-describedby={describedBy}>
      {children}
    </button>
  )
}
