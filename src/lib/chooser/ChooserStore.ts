import { SafeStore } from '@txstate-mws/svelte-store'
import { filterAsync, findIndex, isNotBlank } from 'txstate-utils'
import type { AnyItem, Asset, Client, ChooserType, Folder, Page, Source } from './ChooserAPI.js'

export interface UISource extends Source {
  children?: AnyUIItem[]
}

export interface UIFolder extends Folder {
  children?: (UIFolder|UIAsset)[]
  open?: boolean
  loading?: boolean
}

export interface UIPage extends Page {
  children?: UIPage[]
  open?: boolean
  loading?: boolean
}

export interface UIAsset extends Asset {}

export interface RawURL {
  type: 'raw'
  id: string
  url: string
}

export type AnyUIItem = UIPage|UIFolder|UIAsset

export interface IAssetStore {
  sources?: {
    page: UISource[]
    asset: UISource[]
  }
  activetype: ChooserType
  activesource: number
  preview?: AnyUIItem
  focus?: string
  focusPath?: string
}

export interface ChooserStoreOptions<F> {
  filter?: (itm: AnyItem) => boolean|Promise<boolean>
  passthruFilters?: F
  activeTypes?: ChooserType[]
  activeSources?: string[]
  initialType?: ChooserType
  initialSource?: string
  initialPath?: string
  chooseFolder?: boolean
  onlyImages?: boolean
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

export class ChooserStore<F = any> extends SafeStore<IAssetStore> {
  options: InternalStoreOptions<F>
  constructor (public client: Client) {
    super({ activetype: 'page', activesource: 0 })
    this.setOptions({})
  }

  setOptions (options: ChooserStoreOptions<F>) {
    const activeTypes: ChooserType[] = options.activeTypes?.length ? options.activeTypes : ['asset', 'page']
    const userFilter = options.filter ?? nofilter
    const filter = options.onlyImages
      ? (itm: AnyUIItem) => ((itm.type === 'asset' && !!itm.image) || itm.type === 'folder') && userFilter(itm)
      : userFilter
    this.options = {
      ...options,
      activeTypes,
      activeSources: options.activeSources ? new Set(options.activeSources) : undefined,
      initialType: options.initialType ?? activeTypes[0],
      filter
    }
  }

  getSource (state = this.value) {
    return state.sources?.[state.activetype]?.[state.activesource]
  }

  getSourceIndex (name: string, state = this.value, type = state.activetype) {
    if (!name || !state.sources?.[type]) return 0
    return findIndex<UISource>(state.sources[type], s => s.name === name) ?? 0
  }

  async init (options: ChooserStoreOptions<F>) {
    this.setOptions(options)
    const activetype = this.value.preview ? (this.value.preview.type === 'page' ? 'page' : 'asset') : this.options.initialType
    this.update(v => ({ ...v, loading: true, activetype, activesource: this.getSourceIndex(this.options.initialSource, v, this.options.initialType) }))
    if (!this.getSource()) {
      const [pageSources, assetSources] = await Promise.all([
        this.options.activeTypes.includes('page') ? this.client.getSources('page') : [],
        this.options.activeTypes.includes('asset') ? this.client.getSources('asset') : []
      ])
      this.update(v => {
        v.sources = { page: pageSources.filter(s => !this.options.activeSources || this.options.activeSources.has(s)) ?? [], asset: assetSources.filter(s => !this.options.activeSources || this.options.activeSources.has(s)) ?? [] }
        v.activesource = this.getSourceIndex(this.options.initialSource, v)
        return v
      })
    }
    if (this.value.preview) await this.openPathRecursive(this.value.preview.path)
    else if (this.options.initialPath) await this.openPathRecursive(this.options.initialPath)
    else await this.openPathRecursive('/')

    this.update(v => ({ ...v, loading: false }))
  }

  itemByPath (state: IAssetStore, path: string) {
    const parts = path.substring(1).split('/')
    const source = this.getSource(state)
    let item = source.children?.find(c => c.name === parts[0])
    for (const part of parts.slice(1).filter(isNotBlank)) {
      if (item.type === 'asset') return undefined
      item = (item?.children as AnyUIItem[])?.find(c => c.name === part)
    }
    return item
  }

  async open (folder: UIFolder|UIPage) {
    return await this.openPath(folder.path)
  }

  async openPath (path: string) {
    const folder = this.itemByPath(this.value, path)
    if (!folder || folder.type === 'asset' || folder.open) return
    this.update(v => {
      const folder = this.itemByPath(v, path) as UIFolder|UIPage
      folder.loading = true
      v.focus = folder.id
      return v
    })
    try {
      const children = await filterAsync(await this.client.getChildren(this.getSource().name, path, this.options.passthruFilters), this.options.filter)
      this.update(v => {
        const folder = this.itemByPath(v, path) as UIFolder|UIPage
        folder.open = true
        folder.loading = false
        folder.children = children as any
        return v
      })
    } catch (e: any) {
      console.error(e)
      this.update(v => {
        const folder = this.itemByPath(v, path) as UIFolder|UIPage
        folder.loading = false
        return v
      })
    }
  }

  async openPathRecursive (path: string) {
    const parts = path.substring(1).split('/')
    const source = this.getSource(this.clone(this.value))

    if (!source.children) source.children = await filterAsync(await this.client.getChildren(source.name, '/', this.options.passthruFilters), this.options.filter)
    let current = source.children.find(c => c.name === parts[0]) ?? source.children[0]
    for (const part of parts.slice(1).filter(isNotBlank)) {
      if (!current || current.type === 'asset') break
      if (!current.open) {
        current.children = await filterAsync(await this.client.getChildren(source.name, current.path, this.options.passthruFilters), this.options.filter) as any[]
        current.loading = false
        current.open = true
      }
      current = (current.children as AnyUIItem[]).find(c => c.name === part)
    }
    this.update(v => {
      const currSource = this.getSource(v)
      if (currSource.name !== source.name) return v
      v.sources[v.activetype][v.activesource] = source
      if (!current) return v
      v.focus = current.id
      v.focusPath = current.path
      return v
    })
  }

  async close (folder: UIFolder|UIPage) {
    return await this.closePath(folder.path)
  }

  async closePath (path: string) {
    this.update(v => {
      const folder = this.itemByPath(v, path)
      if (folder && folder.type !== 'asset') folder.open = false
      return v
    })
  }

  async toggle (folder: UIFolder|UIPage) {
    if (folder.open) await this.close(folder)
    else await this.open(folder)
  }

  preview (item?: AnyUIItem) {
    if (!item) return this.clearPreview()
    if (item.type === 'folder' && !this.options.chooseFolder) return
    this.update(v => ({ ...v, preview: item, focus: item.id, focusPath: item.path }))
  }

  clearPreview () {
    this.update(v => ({ ...v, preview: undefined }))
  }

  async changeSource (idx: number) {
    if (idx >= this.value.sources[this.value.activetype].length || idx < 0) return
    this.update(v => {
      v.activesource = idx
      const source = this.getSource(v)
      if (source.children?.length) {
        const firstchild = source.children[0]
        v.focus = firstchild.id
        v.focusPath = firstchild.path
      }
      return v
    })
    const source = this.getSource()
    const children = await filterAsync(await this.client.getChildren(source.name, '/', this.options.passthruFilters), this.options.filter)
    this.update(v => {
      const source = this.getSource(v)
      source.children = children
      v.focus = children[0]?.id
      v.focusPath = children[0] ? children[0]?.path : undefined
      return v
    })
  }

  async setActiveType (type: ChooserType) {
    this.update(v => ({ ...v, activetype: type }))
    await this.changeSource(0)
  }

  setFocus (itm: AnyUIItem) {
    if (!itm) return
    this.update(v => {
      v.focus = itm.id
      v.focusPath = itm.path
      return v
    })
  }
}
