<script>
  import { Form, FieldChooserLink } from '$lib'

  export let acceptMime = undefined
  export let urlEntry = false
  export let filter = undefined
  /** when true, uploads hang until the abort signal fires, for testing cancellation */
  export let hangUploads = false

  let store
  export function getStore () { return store }

  const folder = { type: 'folder', id: 'folder-1', path: '/docs', name: 'docs', source: 'Assets', hasChildren: true, childCount: 2, acceptsUpload: true, url: '/docs' }
  const pdf = { type: 'asset', id: 'asset-pdf', path: '/syllabus.pdf', name: 'syllabus.pdf', source: 'Assets', mime: 'application/pdf', extension: 'pdf', bytes: 1264, url: '/assets/syllabus.pdf' }
  const png = { type: 'asset', id: 'asset-png', path: '/diagram.png', name: 'diagram.png', source: 'Assets', mime: 'image/png', extension: 'png', bytes: 196672, url: '/assets/diagram.png', image: { width: 909, height: 1114 } }

  // mutable mock backend: upload inserts new assets here, getChildren reads from it,
  // so the chooser's post-upload tree refresh sees the uploaded files
  const childrenByPath = { '/': [folder, pdf, png], '/docs': [] }
  export function getFolderContents (path) { return childrenByPath[path] ?? [] }

  const uploadCalls = []
  export function getUploadCalls () { return uploadCalls }

  const allItems = () => Object.values(childrenByPath).flat()

  const chooserClient = {
    getSources: async () => [{ type: 'asset', name: 'Assets' }],
    getChildren: async (source, path) => childrenByPath[path] ?? [],
    find: async () => [],
    findById: async id => allItems().find(itm => itm.type === 'asset' && itm.id === id),
    findByUrl: async url => allItems().find(itm => itm.type === 'asset' && itm.url === url),
    mayUpload: f => f.acceptsUpload,
    upload: async (f, files, progress, signal) => {
      uploadCalls.push({ folder: f, files })
      if (hangUploads) {
        await new Promise((_resolve, reject) => {
          signal?.addEventListener('abort', () => { reject(new Error('upload aborted')) })
        })
      }
      progress(1)
      const uploaded = files.map(file => ({
        type: 'asset',
        id: 'asset-' + file.name,
        path: f.path + '/' + file.name,
        name: file.name,
        source: f.source,
        mime: file.type,
        extension: file.name.split('.').pop(),
        bytes: file.size,
        url: '/assets/' + file.name
      }))
      childrenByPath[f.path] = [...(childrenByPath[f.path] ?? []), ...uploaded]
      return uploaded
    }
  }

  async function submit (data) {
    return { success: true, data, messages: [] }
  }
</script>

<Form bind:store {submit} {chooserClient}>
  <FieldChooserLink label="Document" path="doc" assets {acceptMime} {urlEntry} {filter} />
</Form>
