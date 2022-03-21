import { SafeStore } from '@txstate-mws/svelte-store'
import { findIndex } from 'txstate-utils'
import type { Asset, Client, Folder, Source } from './AssetAPI.js'

export interface UISource extends Source {
  children?: (UIAsset|UIFolder)[]
}

export interface UIFolder extends Folder {
  children?: (UIFolder|UIAsset)[]
  open?: boolean
  loading?: boolean
}

export interface UIAsset extends Asset {}

export interface IAssetStore {
  sources?: UISource[]
  activesource: number
  preview?: Asset
  focus?: string
  focusPath?: string
}

export interface AssetStoreOptions {
  filter: (itm: Asset|Folder) => boolean|Promise<boolean>
  initWithSource?: string
  initWithPath?: string
}

export const ASSET_STORE_CONTEXT = {}

const nofilter = (x: any) => true

function combinePath (path: string, name: string) {
  if (path.endsWith('/')) return path + name
  return path + '/' + name
}

export function bytesToHuman (bytes: number) {
  const scales = [' bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
  const scale = Math.floor(Math.log(bytes) / Math.log(1024))
  return String(parseFloat((bytes / Math.pow(1024, scale)).toPrecision(3))) + scales[scale]
}

export class AssetStore extends SafeStore<IAssetStore> {
  options: AssetStoreOptions
  constructor (public client: Client, options: Partial<AssetStoreOptions> = {}) {
    super({ activesource: 0 })
    this.options = {
      ...options,
      filter: options.filter ?? nofilter
    }
  }

  async init () {
    if (this.value.sources?.length) return
    const sources = await this.client.getSources() as UISource[]
    let focus
    let focusPath
    let initSource = 0
    if (sources?.length) {
      initSource = findIndex(sources, s => s.name === this.options.initWithSource) ?? 0
      const children = await this.client.getChildren(sources[initSource].name, '/', this.options.filter)
      sources[initSource].children = children
      const firstchild = sources[initSource].children[0]
      if (firstchild) {
        focus = firstchild.id
        focusPath = combinePath(firstchild.path, firstchild.name)
      }
    }
    this.update(v => ({ ...v, sources, activesource: initSource, loading: false, focus, focusPath }))
    if (this.value.preview) await this.openPathRecursive(combinePath(this.value.preview.path, this.value.preview.name))
    else if (this.options.initWithPath) await this.openPathRecursive(this.options.initWithPath)
  }

  folderBySourceAndPath (state: IAssetStore, source: number, path: string) {
    const parts = path.substring(1).split('/')
    let folder: UIFolder = state.sources[source] as UIFolder
    for (const part of parts) {
      folder = folder?.children?.find(c => c.type === 'folder' && c.name === part) as UIFolder
    }
    return folder?.type === 'folder' ? folder : undefined
  }

  folderByPath (state: IAssetStore, path: string) {
    return this.folderBySourceAndPath(state, state.activesource, path)
  }

  async open (folder: UIFolder) {
    return await this.openPath(combinePath(folder.path, folder.name))
  }

  async openPath (path: string) {
    const folder = this.folderByPath(this.value, path)
    if (!folder || folder.open) return
    this.update(v => {
      const folder = this.folderByPath(v, path)
      folder.loading = true
      v.focus = folder.id
      return v
    })
    try {
      const children = await this.client.getChildren(this.value.sources[this.value.activesource].name, path, this.options.filter)
      this.update(v => {
        const folder = this.folderByPath(v, path)
        if (folder) {
          folder.open = true
          folder.loading = false
          folder.children = children
        }
        return v
      })
    } catch (e: any) {
      console.error(e)
      this.update(v => {
        const folder = this.folderByPath(v, path)
        if (folder) {
          folder.loading = false
        }
        return v
      })
    }
  }

  async openPathRecursive (path: string) {
    const parts = path.substring(1).split('/')
    const source = this.clone(this.value).sources[this.value.activesource]
    let current = source.children?.find(c => c.name === parts[0])
    let firstopenedfolder: UIFolder
    for (const part of parts.slice(1)) {
      if (!current || current.type === 'asset') break
      if (!current.open) {
        firstopenedfolder ??= current
        current.children = await this.client.getChildren(source.name, combinePath(current.path, current.name), this.options.filter)
        current.loading = false
        current.open = true
      }
      current = current.children.find(c => c.name === part)
    }
    if (this.value.sources[this.value.activesource].name !== source.name || !current) return
    this.update(v => {
      v.focus = current.id
      v.focusPath = combinePath(current.path, current.name)
      const folder = this.folderByPath(v, combinePath(firstopenedfolder.path, firstopenedfolder.name))
      folder.open = true
      folder.loading = false
      folder.children = firstopenedfolder.children
      return v
    })
  }

  async close (folder: UIFolder) {
    return await this.closePath(combinePath(folder.path, folder.name))
  }

  async closePath (path: string) {
    this.update(v => {
      const folder = this.folderByPath(v, path)
      if (folder) folder.open = false
      return v
    })
  }

  async toggle (folder: UIFolder) {
    if (folder.open) await this.close(folder)
    else await this.open(folder)
  }

  async preview (asset: Asset) {
    this.update(v => ({ ...v, preview: asset, focus: asset.id }))
  }

  async changeSource (idx: number) {
    if (idx >= this.value.sources.length || idx < 0) return
    this.update(v => ({ ...v, activesource: idx, focus: v.sources[idx].children?.[0]?.id }))
    const source = this.value.sources[this.value.activesource]
    if (source.children?.length) return
    const children = await this.client.getChildren(this.value.sources[idx].name, '/', this.options.filter)
    this.update(v => {
      v.sources[idx].children = children
      v.focus = children[0]?.id
      v.focusPath = children[0] ? combinePath(children[0]?.path, children[0].name) : undefined
      return v
    })
  }

  setFocus (itm: UIAsset|UIFolder) {
    if (!itm) return
    this.update(v => {
      v.focus = itm.id
      v.focusPath = combinePath(itm.path, itm.name)
      return v
    })
  }
}
