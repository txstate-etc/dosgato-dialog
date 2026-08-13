import { TreeStore, type TypedTreeItem } from '$lib/tree/treestore.js'
import { Store, derivedStore } from '@txstate-mws/svelte-store'
import { tick } from 'svelte'
import { derived } from 'svelte/store'
import { filterAsync, findIndex, omit } from 'txstate-utils'
import { dedupeSelections, type DataChooserClient, type DataChooserItem, type DataChooserSource } from './DataChooserAPI.js'

export type DataUIItem = TypedTreeItem<DataChooserItem>

export interface IDataChooserStore {
  sources?: DataChooserSource[]
  activesource: number
  initialized: boolean
  preview?: DataChooserItem | DataUIItem
  /**
   * selections being remembered for sources other than the active one, keyed by
   * source name; the tree only holds the active source's selections
   */
  stashed: Record<string, DataChooserItem[]>
}

export interface DataChooserStoreOptions<F> {
  rootTemplateKey?: string
  filter?: (itm: DataChooserItem) => boolean | Promise<boolean>
  /**
   * return true to disable selection of an item; unlike `filter`, which hides
   * items and their descendants entirely, disabled items stay visible and
   * browsable - they just cannot be selected and their checkboxes render disabled
   *
   * only items are passed in, never folders - folder selection is governed solely
   * by the selectableFolders option
   */
  disable?: (itm: DataChooserItem) => boolean
  /**
   * hide items whose `published` status is 'unpublished'; 'modified' items still
   * have a live published version, so they remain choosable, as do items with no
   * status at all (containers, or clients that do not track publish status)
   */
  publishedOnly?: boolean
  /**
   * allow the user to select multiple items; selections in other sources are
   * remembered while the user browses the active source, but collapsing a folder
   * discards the selections beneath it
   */
  multiple?: boolean
  /**
   * allow items marked `folder` to be chosen as values; a chosen folder means
   * "everything beneath it, now and in the future", so selections beneath a chosen
   * folder are deduplicated away when the user confirms
   */
  selectableFolders?: boolean
  passthruFilters?: F
  activeSources?: string[]
  initialSource?: string
}

interface InternalDataStoreOptions<F> extends Omit<DataChooserStoreOptions<F>, 'activeSources'> {
  activeSources?: Set<string>
}

export const DATA_CHOOSER_STORE_CONTEXT = {}

const nofilter = (x: any) => true

export class DataChooserStore<F = any> extends Store<IDataChooserStore> {
  options!: InternalDataStoreOptions<F>
  constructor (public client: DataChooserClient<F>) {
    super({ activesource: 0, initialized: false, stashed: {} })
    this.setOptions({})
  }

  setOptions (options: DataChooserStoreOptions<F>) {
    this.options = {
      ...options,
      activeSources: options.activeSources ? new Set(options.activeSources) : undefined
    }
  }

  async fetchChildren (item?: DataUIItem): Promise<DataChooserItem[]> {
    const $source = this.getSource()
    if (!$source || (item && !item.hasChildren)) return []
    const children = await this.fetchFiltered($source.name, item?.path ?? '/')
    // the client reports hasChildren/childCount for the unfiltered tree, so a
    // container could show an expand arrow and then come up empty; when we are
    // filtering client-side, look ahead one level so arrows and counts are
    // post-filter - but only when the user opens a container, as a performance
    // tradeoff; root-level arrows stay client-reported and self-correct on open
    if (item != null && (this.options.filter || this.options.publishedOnly)) {
      await Promise.all(children.filter(c => c.hasChildren).map(async c => {
        const grandchildren = await this.fetchFiltered($source.name, c.path)
        c.hasChildren = grandchildren.length > 0
        c.childCount = grandchildren.length
      }))
    }
    return children
  }

  protected async fetchFiltered (source: string, path: string) {
    let children = await this.client.getChildren(this.options.rootTemplateKey ?? '', source, path, this.options.passthruFilters)
    if (this.options.publishedOnly) children = children.filter(c => c.published !== 'unpublished')
    return await filterAsync(children, this.options.filter ?? nofilter)
  }

  treeStore = new TreeStore<DataChooserItem>(this.fetchChildren.bind(this))

  sources = derivedStore(this, v => (v.sources ?? []).filter(s => this.options.activeSources ? this.options.activeSources.has(s.name) : true))
  source = derivedStore(this, v => this.getSource(v))
  preview = derivedStore(this, 'preview')
  selected = derivedStore<DataUIItem | undefined>(this.treeStore, 'selectedItems.0')
  /**
   * the current selections that would become the value if the user confirmed right
   * now: stashed selections from other sources plus the tree's choosable selections,
   * with selections beneath selected folders deduplicated
   */
  chosen = derived([this as Store<IDataChooserStore>, this.treeStore], ([v, t]) => dedupeSelections(
    [...Object.values(v.stashed).flat(), ...t.selectedItems].filter(itm => this.isChoosable(itm))
  ))

  getSource (state = this.value) {
    return this.filteredSources(state)[state.activesource]
  }

  filteredSources (state = this.value) {
    return (state.sources ?? []).filter(s => this.options.activeSources ? this.options.activeSources.has(s.name) : true)
  }

  async init (options: DataChooserStoreOptions<F>) {
    this.setOptions(options)
    const sources = await this.client.getSources(this.options.rootTemplateKey ?? '', this.options.passthruFilters)
    // the store outlives the dialog, so clear any stash from a previous open
    this.update(v => ({ ...v, sources, stashed: {} }))
    this.setSource(this.options.initialSource, true)
    await tick()
    this.update(v => ({ ...v, initialized: true }))
  }

  /** remember selections for a source while the user browses another */
  stashSelections (source: string, items: DataChooserItem[]) {
    this.update(v => ({ ...v, stashed: { ...v.stashed, [source]: items } }))
  }

  /** withdraw a source's remembered selections so they can be restored into the tree */
  takeStash (source: string) {
    const items = this.value.stashed[source] ?? []
    this.update(v => ({ ...v, stashed: omit(v.stashed, source) }))
    return items
  }

  /**
   * containers are only choosable when they are folders and the selectableFolders
   * option is on; the disable option can reject items on top of that, but it
   * never sees folders
   */
  isChoosable (item: DataChooserItem) {
    if (item.templateKey == null) return !!(this.options.selectableFolders && item.folder)
    return !this.options.disable?.(item)
  }

  setPreview (item?: DataChooserItem | DataUIItem) {
    if (!item) { this.clearPreview(); return }
    if (!this.isChoosable(item)) return
    this.update(v => ({ ...v, preview: item }))
  }

  clearPreview () {
    this.update(v => ({ ...v, preview: undefined }))
  }

  setSource (name?: string, init?: boolean) {
    this.update(v => {
      if (!v.initialized && !init) return v
      const sources = this.filteredSources(v)
      const idx = name ? findIndex(sources, s => s.name === name) : 0
      return { ...v, activesource: idx ?? 0 }
    })
  }
}
