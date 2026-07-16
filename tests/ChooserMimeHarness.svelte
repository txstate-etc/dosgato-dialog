<script>
  import { Form, FieldChooserLink } from '$lib'

  export let acceptMime = undefined
  export let urlEntry = false
  export let filter = undefined

  let store
  export function getStore () { return store }

  const folder = { type: 'folder', id: 'folder-1', path: '/docs', name: 'docs', source: 'Assets', hasChildren: true, childCount: 2, acceptsUpload: false, url: '/docs' }
  const pdf = { type: 'asset', id: 'asset-pdf', path: '/syllabus.pdf', name: 'syllabus.pdf', source: 'Assets', mime: 'application/pdf', extension: 'pdf', bytes: 1264, url: '/assets/syllabus.pdf' }
  const png = { type: 'asset', id: 'asset-png', path: '/diagram.png', name: 'diagram.png', source: 'Assets', mime: 'image/png', extension: 'png', bytes: 196672, url: '/assets/diagram.png', image: { width: 909, height: 1114 } }

  const chooserClient = {
    getSources: async () => [{ type: 'asset', name: 'Assets' }],
    getChildren: async (source, path) => path === '/' ? [folder, pdf, png] : [],
    find: async () => [],
    findById: async id => [pdf, png].find(a => a.id === id),
    findByUrl: async url => [pdf, png].find(a => a.url === url)
  }

  async function submit (data) {
    return { success: true, data, messages: [] }
  }
</script>

<Form bind:store {submit} {chooserClient}>
  <FieldChooserLink label="Document" path="doc" assets {acceptMime} {urlEntry} {filter} />
</Form>
