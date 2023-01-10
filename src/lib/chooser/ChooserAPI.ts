export const CHOOSER_API_CONTEXT = {}
export type ChooserType = 'asset' | 'page'
export type AnyItem = Asset | Folder | Page

export interface Client<F = any> {
  getSources: (type: ChooserType) => Promise<Source[]>
  getChildren: (source: string, path: string, filters: F) => Promise<AnyItem[]>

  // should be a recursive search
  find: (source: string, path: string, searchstring: string, filters: F) => Promise<AnyItem[]>

  // if the form is preloaded with asset/folder identifiers, we will need a way to get
  // and display metadata like filenames and image previews
  // note that your API implementation must be able to determine the correct chooser type
  // and source from the identifier alone
  findById: (id: string) => Promise<AnyItem | undefined>

  // we often use a form control where the user may enter a URL directly OR choose something
  // internal
  // if this function can be implemented, we can resolve whether the user-entered URL actually
  // points to something internal, and automatically make the internal selection rather
  // than simply recording the URL
  findByUrl?: (url: string) => Promise<AnyItem | undefined>

  // If the user enters a URL that does not match any internal items, your application
  // may prefer a different format for the form value than just the raw URL string
  // implement this function to convert a URL to the desired form value
  // for instance perhaps "http://google.com" -> "{ type: 'url', url: 'http://google.com' }"
  urlToValue?: (url: string) => string

  /**
   * If the form is preloaded with a raw URL, findById returns undefined, and the client implements
   * urlToValue, we will need a way to decode/reverse what urlToValue does. This function should
   * do that.
   */
  valueToUrl?: (value: string) => string

  // must accept a standard FileList object and upload the files to the service
  // should throw an error if the source/path does not accept uploads
  // the UI is responsible for refreshing the folder list after success
  upload: (source: string, path: string, files: FileList) => Promise<void>
}

export interface Source {
  type: ChooserType
  // this must be immutable or else existing links saved in the system will break
  name: string
  // label is shown to the user, can change it at will
  label?: string
  rootAcceptsUpload?: boolean
}

interface Item {
  /**
   * this is the identifier that will be added to the form's JSON payload
   * when this folder is selected by the user
   * for DosGato it will be a stringified AssetLink, AssetFolderLink, or
   * PageLink (see dosgato-templating/src/links.ts)
   */
  id: string
  /**
   * path to the item, MUST include the item itself, so ends with /${name}
   */
  path: string
  name: string
  source: string
  /**
   * Identifier for the urlEntry input
   *
   * When urlEntry prop is true, the user gets a text field where they can freely
   * enter a string to identify the object being chosen. This value will be
   * placed in that field when they use the chooser.
   *
   * It should be reversible with the `findByUrl` function provided by your chooser
   * client, but note that the `findByUrl` function can accept multiple URLs that
   * all point to the same resource. If the user types anything that can identify
   * a resource, the resource will show up in the "Details" area, but the URL the user
   * typed will NOT change to the one provided by this property. We try not
   * to rewrite values in the form fields where possible, because it can disrupt the
   * user's interaction.
   */
  url: string
}

export interface Folder extends Item {
  type: 'folder'
  hasChildren: boolean
  acceptsUpload: boolean // from the current authenticated user
  url: string
}

export interface Page extends Item {
  type: 'page'
  title?: string
  hasChildren: boolean
  url: string
}

export interface Asset extends Item {
  type: 'asset'
  title?: string
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
