import { TreeStore, type TypedTreeItem } from '$lib/tree/treestore.js'
import { Store, derivedStore } from '@txstate-mws/svelte-store'
import { tick } from 'svelte'
import { filterAsync, findIndex } from 'txstate-utils'
import type { DataChooserClient, DataChooserItem, DataChooserSource } from './DataChooserAPI.js'

export type DataUIItem = TypedTreeItem<DataChooserItem>

export interface IDataChooserStore {
  sources?: DataChooserSource[]
  activesource: number
  initialized: boolean
  preview?: DataChooserItem | DataUIItem
}

export interface DataChooserStoreOptions<F> {
  rootTemplateKey?: string
  filter?: (itm: DataChooserItem) => boolean | Promise<boolean>
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
    super({ activesource: 0, initialized: false })
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
    const children = await this.client.getChildren(this.options.rootTemplateKey ?? '', $source.name, item?.path ?? '/', this.options.passthruFilters)
    return await filterAsync(children, this.options.filter ?? nofilter)
  }

  treeStore = new TreeStore<DataChooserItem>(this.fetchChildren.bind(this))

  sources = derivedStore(this, v => (v.sources ?? []).filter(s => this.options.activeSources ? this.options.activeSources.has(s.name) : true))
  source = derivedStore(this, v => this.getSource(v))
  preview = derivedStore(this, 'preview')
  selected = derivedStore<DataUIItem | undefined>(this.treeStore, 'selectedItems.0')

  getSource (state = this.value) {
    return this.filteredSources(state)[state.activesource]
  }

  filteredSources (state = this.value) {
    return (state.sources ?? []).filter(s => this.options.activeSources ? this.options.activeSources.has(s.name) : true)
  }

  async init (options: DataChooserStoreOptions<F>) {
    this.setOptions(options)
    const sources = await this.client.getSources(this.options.rootTemplateKey ?? '', this.options.passthruFilters)
    this.update(v => ({ ...v, sources }))
    this.setSource(this.options.initialSource, true)
    await tick()
    this.update(v => ({ ...v, initialized: true }))
  }

  setPreview (item?: DataChooserItem | DataUIItem) {
    if (!item) { this.clearPreview(); return }
    if (item.templateKey == null) return
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
