import type { IconifyIcon } from '@iconify/svelte'

export const DATA_CHOOSER_API_CONTEXT = {}

export interface DataChooserClient<F = any> {
  /**
   * Data items are always organized beneath a templateKey, so every method receives
   * the rootTemplateKey the dialog field is configured to choose from. It is "root"
   * because items beneath it may carry other templateKeys - e.g. a rootTemplateKey of
   * 'book' where each book contains items with a 'chapter' templateKey. Sources are a
   * further top-level division beneath the rootTemplateKey (for DosGato probably
   * something like global data vs data owned by each site, but dosgato-dialog makes
   * no assumptions).
   *
   * If there is only one source for a rootTemplateKey, the chooser will not display
   * source tabs.
   */
  getSources: (rootTemplateKey: string, filters?: F) => Promise<DataChooserSource[]>

  /**
   * return the items directly beneath the given path, where '/' means the root of the
   * source; items are hierarchical but containers are not necessarily folders - use
   * `icon` to communicate what each item is, and `hasChildren` / `templateKey` to
   * control the tree behavior
   */
  getChildren: (rootTemplateKey: string, source: string, path: string, filters?: F) => Promise<DataChooserItem[]>

  /**
   * if the form is preloaded with a data item identifier, we need a way to retrieve
   * the item so we can display its name and details
   *
   * the rootTemplateKey the field is configured for is provided as a convenience, but
   * ids should be unique across all templateKeys
   *
   * return undefined if the id does not resolve (e.g. the item was deleted or the user
   * may not see it); the field will show an "unknown item" state and preserve the value
   * unless the user replaces or removes it (or, with multiple, confirms an edited
   * selection, since unknown items cannot be shown in the chooser)
   */
  findById: (rootTemplateKey: string, id: string) => Promise<DataChooserItem | undefined>
}

/**
 * 'published' - the live version is the latest version
 * 'modified' - published, but with unpublished changes pending
 * 'unpublished' - no published version exists
 */
export type DataChooserPublishedStatus = 'published' | 'modified' | 'unpublished'

export interface DataChooserSource {
  // this must be immutable or else existing selections saved in the system may
  // be difficult to trace back to their source
  name: string
  // label is shown to the user, can change it at will
  label?: string
}

export interface DataChooserItem {
  /**
   * this is the identifier that will be added to the form's JSON payload when this
   * item is selected by the user
   * for DosGato it will probably be a stringified DataLink, but any string works
   */
  id: string
  /**
   * name unique among siblings; paths are built from names, so it should not
   * contain slashes
   */
  name: string
  /**
   * optional display label; `name` is displayed when absent
   */
  label?: string
  /**
   * path to the item, MUST include the item itself, so ends with /${name}
   */
  path: string
  source: string
  /**
   * the template key of the data object, undefined/null means this item is solely a
   * container (a folder, site, etc) and may not be chosen as the field's value
   *
   * an item may have a templateKey and also be a container - e.g. a data item might
   * eventually contain data items of another type - and the `filter` prop on
   * FieldDataChooser can use this to restrict choices to specific types of data
   */
  templateKey?: string
  /**
   * whether this item contains children and should be expandable in the tree; any
   * item may be a container - e.g. a data item might eventually contain data items
   * of another type
   */
  hasChildren: boolean
  /**
   * mark true if this container is a folder, as opposed to some other kind of
   * container like a site
   *
   * folders may be chosen as values when the field enables `selectableFolders`;
   * choosing a folder means "everything beneath it, now and in the future", so its
   * `id` should be a stable identifier the implementing application can resolve to
   * the folder's contents at render time (for DosGato a stringified DataFolderLink)
   */
  folder?: boolean
  childCount?: number
  /**
   * icon shown in the tree and preview area; the client decides how to visually
   * distinguish its various kinds of containers and items
   * when absent, a generic folder icon is used for containers and a generic data
   * icon for everything else
   */
  icon?: { icon: IconifyIcon, label?: string }
  /**
   * publish status of the data item; shown as a Status row in the preview pane
   * and used by the `publishedOnly` prop on FieldDataChooser to hide unpublished
   * items
   *
   * leave undefined for containers or when the client does not track publish
   * status; items without a status are never hidden by `publishedOnly`
   */
  published?: DataChooserPublishedStatus
  /**
   * extra label/value rows to show in the preview pane and after selection,
   * e.g. last modified date
   */
  details?: { label: string, value: string }[]
}

/**
 * when the form is preloaded with an id that findById cannot resolve, the field
 * keeps the value around in case the item comes back (or the user simply may not
 * see it) and represents it with this type
 */
export interface UnknownDataItem {
  broken: true
  id: string
}

/**
 * a selected folder means "everything beneath it, now and in the future", so any
 * other selection beneath a selected folder is redundant and gets dropped when the
 * user confirms their selections
 */
export function dedupeSelections<T extends DataChooserItem> (items: T[]): T[] {
  const folders = items.filter(itm => itm.folder)
  return items.filter(itm => !folders.some(f => f.id !== itm.id && f.source === itm.source && itm.path.startsWith(f.path + '/')))
}

/**
 * summarize a multiple selection for display, e.g. "2 folders, 3 items"
 */
export function describeSelections (items: (DataChooserItem | UnknownDataItem)[]): string {
  const folders = items.filter(itm => !('broken' in itm) && itm.folder).length
  const broken = items.filter(itm => 'broken' in itm).length
  const others = items.length - folders - broken
  const parts: string[] = []
  if (folders) parts.push(`${folders} folder${folders === 1 ? '' : 's'}`)
  if (others) parts.push(`${others} item${others === 1 ? '' : 's'}`)
  if (broken) parts.push(`${broken} unknown item${broken === 1 ? '' : 's'}`)
  return parts.join(', ')
}
