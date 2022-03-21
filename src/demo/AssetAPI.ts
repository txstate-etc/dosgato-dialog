import type * as assetAPI from '$lib/AssetAPI'
import { filterAsync, randomid } from 'txstate-utils'

interface RootFolder {
  assets?: assetAPI.Asset[]
  folders?: FolderWithChildren[]
  acceptsUpload?: boolean
}
interface FolderWithChildren extends Omit<RootFolder, 'acceptsUpload'>, assetAPI.Folder {}

const data: Record<string, RootFolder> = {
  DosGato: {
    folders: [
      {
        type: 'folder',
        id: 'folder-1',
        name: 'biology',
        path: '/',
        acceptsUpload: true,
        folders: [
          {
            type: 'folder',
            id: 'folder-4',
            name: 'evolutionary',
            path: '/biology',
            acceptsUpload: false,
            assets: [
              { type: 'asset', id: 'asset-3', path: '/biology/evolutionary', name: 'missinglink.png', mime: 'image/png', bytes: 196672, url: '/static/demo-full.png', image: { width: 909, height: 1114, thumbnailUrl: '/static/demo-thumb.png' } }
            ]
          },
          { type: 'folder', id: 'folder-5', name: 'humananatomy', path: '/biology', acceptsUpload: false }
        ]
      },
      {
        type: 'folder',
        id: 'folder-2',
        name: 'chemistry',
        path: '/',
        acceptsUpload: true,
        folders: [
          { type: 'folder', id: 'folder-6', name: 'organic', path: '/chemistry', acceptsUpload: true }
        ]
      },
      {
        type: 'folder',
        id: 'folder-3',
        name: 'physics',
        path: '/',
        acceptsUpload: true,
        assets: [
          { type: 'asset', id: 'asset-1', path: '/physics', name: 'cannondiagram.png', mime: 'image/png', bytes: 196672, url: '/static/demo-full.png', image: { width: 909, height: 1114, thumbnailUrl: '/static/demo-thumb.png' } },
          { type: 'asset', id: 'asset-2', path: '/physics', name: 'modernphysics.pdf', mime: 'application/pdf', bytes: 1264, url: '/static/demo-full.png' }
        ]
      }
    ]
  },
  Canto: {
    folders: []
  }
}

class DemoAssetAPI implements assetAPI.Client {
  async getSources () {
    return [{ name: 'DosGato' }, { name: 'Canto' }]
  }

  findFolder (source: string, path: string) {
    if (path === '/') return data[source]
    const parts = path.substring(1).split('/')
    let folders = data[source].folders
    let folder: FolderWithChildren
    for (const part of parts) {
      folder = folders.find(f => f.name === part)
      if (!folder) throw new Error(`path ${path} not found in source ${source}`)
      folders = folder.folders ?? []
    }
    return folder
  }

  walkFolder (folder: RootFolder) {
    const ret = folder.assets ?? []
    for (const f of folder.folders ?? []) {
      ret.push(...this.walkFolder(f))
    }
    return ret
  }

  async getChildren (source: string, path: string, filter: (assetOrFolder: assetAPI.Asset | assetAPI.Folder) => boolean | Promise<boolean>) {
    const folder = this.findFolder(source, path)
    return await filterAsync([...(folder.folders as assetAPI.Folder[] ?? []), ...(folder?.assets ?? [])], filter)
  }

  async findAssets (source: string, path: string, searchstring: string, filter: (asset: assetAPI.Asset) => boolean | Promise<boolean>) {
    const folder = this.findFolder(source, path)
    const assets = this.walkFolder(folder)
    const search = searchstring.toLocaleLowerCase()
    return await filterAsync(assets.filter(a => a.name.toLocaleLowerCase().includes(search)), filter)
  }

  async findById (id: string) {
    for (const rootfolder of Object.values(data)) {
      const asset = rootfolder.assets?.find(a => a.id === id)
      if (asset) return asset
      for (const folder of rootfolder.folders) {
        if (folder.id === id) return folder
        const assets = this.walkFolder(folder)
        const asset = assets.find(a => a.id === id)
        if (asset) return asset
      }
    }
    throw new Error('Asset or Folder ID not found.')
  }

  async upload (source: string, path: string, files: FileList) {
    if (path === '/') throw new Error('User may not upload to the root.')
    const folder = this.findFolder(source, path)
    if (!folder?.acceptsUpload) throw new Error('User may not upload to this folder')
    folder.assets ??= []
    for (const file of Array.from(files)) {
      const isImage = file.type.startsWith('image')
      const asset: assetAPI.Asset = { type: 'asset', id: randomid(), path, name: file.name, mime: isImage ? 'image/png' : 'application/pdf', bytes: isImage ? 196672 : 1264, url: isImage ? '/static/demo-full.png' : '/static/blankpdf.pdf' }
      if (isImage) {
        asset.image = {
          width: 909,
          height: 1114,
          thumbnailUrl: '/static/demo-thumb.png'
        }
      }
      folder.assets.push(asset)
    }
  }
}

export const demoAssetAPI = new DemoAssetAPI()
