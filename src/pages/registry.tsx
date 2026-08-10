import type { ComponentType } from 'react'
import { Donate } from './Donate'
import { Home } from './Home'
import { Involved } from './Involved'
import { Nancy } from './Nancy'
import { NotFound } from './NotFound'
import { Platform } from './Platform'
import { Thanks } from './Thanks'

/**
 * The one place a page id maps to its component.
 *
 * Both entry points read this: the server renders from it at build time, the
 * client hydrates from it. Two switch statements would be two chances for the
 * client to mount a different component than the server rendered, which is the
 * single most confusing hydration bug to diagnose — the page simply reverts to
 * its initial state a moment after load, with no error.
 *
 * Every page takes the same props so the registry can stay a plain record.
 * Pages that do not need `web3formsKey` ignore it.
 */
export type PageProps = {
  readonly base: string
  readonly web3formsKey: string | null
  /** Absolute URL, or null when SITE_ORIGIN is unset. */
  readonly thanksUrl: string | null
}

export const PAGE_COMPONENTS: Record<string, ComponentType<PageProps> | undefined> = {
  home: Home,
  nancy: Nancy,
  platform: Platform,
  involved: Involved,
  donate: Donate,
  thanks: Thanks,
  'not-found': NotFound,
}
