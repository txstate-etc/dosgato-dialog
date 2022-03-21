export interface Client {
  getSources: () => Promise<Source[]>
  getChildren: (source: string, path: string, filter: (assetOrFolder: Asset|Folder) => boolean|Promise<boolean>) => Promise<(Asset|Folder)[]>

  // should be a recursive search
  findAssets: (source: string, path: string, searchstring: string, filter: (asset: Asset) => boolean|Promise<boolean>) => Promise<Asset[]>

  // if the form is preloaded with asset/folder identifiers, we will need a way to get
  // and display metadata like filenames and image previews
  // note that your API implementation must be able to determine the correct source
  // from the identifier alone
  findById: (id: string) => Promise<Asset|Folder>

  // must accept a standard FileList object and upload the files to the service
  // should throw an error if the source/path does not accept uploads
  // the UI is responsible for refreshing the folder list after success
  upload: (source: string, path: string, files: FileList) => Promise<void>
}

export interface Source {
  name: string
  rootAcceptsUpload?: boolean
}

export interface Folder {
  type: 'folder'
  // this is the identifier that will be added to the form's JSON payload
  // when this folder is selected by the user
  // for DosGato it will be a stringified AssetFolderLink (see dosgato-templating/src/links.ts)
  id: string
  path: string
  name: string
  acceptsUpload: boolean // from the current authenticated user
}

export interface Asset {
  type: 'asset'
  // this is the identifier that will be added to the form's JSON payload
  // when this asset is selected by the user
  // for DosGato it will be a stringified AssetLink (see dosgato-templating/src/links.ts)
  id: string
  path: string
  name: string
  mime: string
  bytes: number
  url: string
  image?: {
    width: number
    height: number
    // separate URL for smaller version for use in chooser UI
    // thumbnail should have the same aspect ratio as the full image
    thumbnailUrl?: string
  }
}
