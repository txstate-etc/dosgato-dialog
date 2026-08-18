import type { IconifyIcon } from '@iconify/svelte'
import circleIcon from '@iconify-icons/mdi/circle'
import squareIcon from '@iconify-icons/mdi/square'
import triangleIcon from '@iconify-icons/mdi/triangle'
import type { TreeIcon } from './tree/treestore.js'

/**
 * 'published' - the live version is the latest version
 * 'modified' - published, but with unpublished changes pending
 * 'unpublished' - no published version exists
 */
export type PublishedStatus = 'published' | 'modified' | 'unpublished'

/**
 * the shapes DosGato uses to represent publish status in tree columns; each
 * status gets a distinct shape as well as a distinct color so that colorblind
 * users can still tell them apart
 */
export const publishedStatusIcons: Record<PublishedStatus, IconifyIcon> = {
  published: triangleIcon,
  modified: circleIcon,
  unpublished: squareIcon
}

/**
 * the colors that go with publishedStatusIcons; each resolves a --dosgato-*
 * CSS custom property first so a theme can override the fallback hex
 */
export const publishedStatusColors: Record<PublishedStatus, string> = {
  published: 'var(--dosgato-green, #689600)',
  modified: 'var(--dosgato-yellow, #ffbf28)',
  unpublished: 'var(--dosgato-red, #9a3332)'
}

/**
 * ready-to-use TreeIcon for a publish status tree column; the icon's class is
 * the status name, so color it by pairing with publishedStatusColors, e.g.
 * `.tree-cell.status .icon.published { color: ... }`
 */
export function publishedStatusTreeIcon (status: PublishedStatus): TreeIcon {
  return { icon: publishedStatusIcons[status], label: status, class: status, tooltip: status }
}
