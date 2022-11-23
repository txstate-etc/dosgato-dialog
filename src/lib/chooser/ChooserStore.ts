import type { TypedTreeItem } from '$lib/tree/treestore.js'
import { Store, derivedStore } from '@txstate-mws/svelte-store'
import { tick } from 'svelte'
import { findIndex } from 'txstate-utils'
import type { AnyItem, Asset, Client, ChooserType, Folder, Page, Source } from './ChooserAPI.js'

export interface UISource extends Source {
  children?: AnyUIItem[]
}

export interface RawURL {
  type: 'raw'
  id: string
  url: string
}

export type AnyUIItem = TypedTreeItem<Page | Asset | Folder>

export interface IAssetStore {
  sources?: {
    page: UISource[]
    asset: UISource[]
  }
  activetype: ChooserType
  activesource: number
  initialized: boolean
  preview?: AnyItem
}

export interface ChooserStoreOptions<F> {
  pages?: boolean
  assets?: boolean
  images?: boolean
  folders?: boolean
  filter?: (itm: AnyItem) => boolean | Promise<boolean>
  passthruFilters?: F
  activeSources?: string[]
  initialSource?: string
  initialPath?: string
}

interface InternalStoreOptions<F> extends Omit<ChooserStoreOptions<F>, 'activeSources'> {
  activeSources?: Set<string>
}

export const CHOOSER_STORE_CONTEXT = {}

const nofilter = (x: any) => true

export function combinePath (path: string, name: string) {
  if (path.endsWith('/')) return path + name
  return path + '/' + name
}

export function bytesToHuman (bytes: number) {
  const scales = [' bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
  const scale = Math.floor(Math.log(bytes) / Math.log(1024))
  return String(parseFloat((bytes / Math.pow(1024, scale)).toPrecision(3))) + scales[scale]
}

export class ChooserStore<F = any> extends Store<IAssetStore> {
  options: InternalStoreOptions<F>
  constructor (public client: Client) {
    super({ activetype: 'page', activesource: 0, initialized: false })
    this.setOptions({})
  }

  setOptions (options: ChooserStoreOptions<F>) {
    const userFilter = options.filter ?? nofilter
    const filter = options.images
      ? (itm: AnyUIItem) => ((itm.type === 'asset' && !!itm.image) || itm.type === 'folder') && userFilter(itm)
      : userFilter
    this.options = {
      ...options,
      activeSources: options.activeSources ? new Set(options.activeSources) : undefined,
      filter
    }
  }

  sources = derivedStore(this, v => [...(v.sources?.page ?? []), ...(v.sources?.asset ?? [])].filter(s => this.options.activeSources ? this.options.activeSources.has(s.name) : true))
  source = derivedStore(this, v => this.getSource(v))
  preview = derivedStore(this, 'preview')

  getSource (state = this.value) {
    return state.sources?.[state.activetype]?.[state.activesource]
  }

  getSourceIndex (name: string, state = this.value, type = state.activetype) {
    if (!name || !state.sources?.[type]) return 0
    return findIndex<UISource>(state.sources[type], s => s.name === name) ?? 0
  }

  async init (options: ChooserStoreOptions<F>) {
    this.setOptions(options)
    const [pageSources, assetSources] = await Promise.all([
      this.options.pages ? this.client.getSources('page') : [],
      this.options.assets ? this.client.getSources('asset') : []
    ])
    this.update(v => {
      const sources = { page: pageSources.filter(s => !this.options.activeSources || this.options.activeSources.has(s)) ?? [], asset: assetSources.filter(s => !this.options.activeSources || this.options.activeSources.has(s)) ?? [] }
      return { ...v, sources }
    })
    this.setSource(this.value.preview?.source ?? this.options.initialSource, true)
    console.log('before initialized', this.value)
    await tick()
    console.log('just before initialized')
    this.update(v => ({ ...v, initialized: true }))
  }

  setPreview (item?: AnyItem) {
    if (!item) return this.clearPreview()
    if (item.type === 'folder' && !this.options.folders) return
    this.update(v => ({ ...v, preview: item }))
  }

  clearPreview () {
    this.update(v => ({ ...v, preview: undefined }))
  }

  setSource (name: string, init?: boolean) {
    this.update(v => {
      if (!v.initialized && !init) return v
      const pageSource = v.sources?.page.findIndex(s => s.name === name)
      const assetSource = v.sources?.asset.findIndex(s => s.name === name)
      if (pageSource >= 0) return { ...v, activetype: 'page', activesource: pageSource }
      else if (assetSource >= 0) return { ...v, activetype: 'asset', activesource: assetSource }
      return v
    })
  }
}
