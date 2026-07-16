import { flushSync, mount, unmount } from 'svelte'
import { get } from 'svelte/store'
import { expect, it } from 'vitest'
import { ChooserStore, UploadUI } from '$lib'
import Harness from './ChooserMimeHarness.svelte'

const folder = { type: 'folder', id: 'folder-1', path: '/docs', name: 'docs', source: 'Assets', hasChildren: true, childCount: 2, acceptsUpload: false, url: '/docs' }
const pdf = { type: 'asset', id: 'asset-pdf', path: '/syllabus.pdf', name: 'syllabus.pdf', source: 'Assets', mime: 'application/pdf', extension: 'pdf', bytes: 1264, url: '/assets/syllabus.pdf' }
const png = { type: 'asset', id: 'asset-png', path: '/diagram.png', name: 'diagram.png', source: 'Assets', mime: 'image/png', extension: 'png', bytes: 196672, url: '/assets/diagram.png', image: { width: 909, height: 1114 } }

const client = {
  getSources: async () => [{ type: 'asset', name: 'Assets' }],
  getChildren: async (source, path) => path === '/' ? [folder, pdf, png] : [],
  find: async () => [],
  findById: async id => [pdf, png].find(a => a.id === id)
}

async function settle (ms = 0) {
  await new Promise(resolve => setTimeout(resolve, ms))
  flushSync()
}

it('ChooserStore.fetchChildren applies the filter option to fetched children', async () => {
  const store = new ChooserStore(client)
  await store.init({ assets: true, filter: itm => itm.type !== 'asset' || itm.mime === 'application/pdf' })
  const children = await store.fetchChildren()
  expect(children.map(c => c.id)).toEqual(['folder-1', 'asset-pdf'])
})

it('ChooserStore.fetchChildren drops non-image assets but keeps folders when images is set', async () => {
  const store = new ChooserStore(client)
  await store.init({ assets: true, images: true })
  const children = await store.fetchChildren()
  expect(children.map(c => c.id)).toEqual(['folder-1', 'asset-png'])
})

it('FieldChooserLink acceptMime hides unacceptable assets in the chooser', async () => {
  const target = document.createElement('div')
  document.body.appendChild(target)
  const component = mount(Harness, { target, props: { acceptMime: ['application/pdf'] } })
  flushSync()

  const selectbutton = Array.from(target.querySelectorAll('button')).find(b => b.textContent.includes('Select'))
  expect(selectbutton).toBeDefined()
  selectbutton.click()
  // chooser init involves several awaits (getSources, tick, getChildren) and the
  // Tree waits on requestAnimationFrame before mounting rows
  for (let i = 0; i < 5; i++) await settle(30)

  // the chooser dialog renders in a modal that may portal outside the harness target
  expect(document.body.textContent).toContain('syllabus.pdf')
  expect(document.body.textContent).not.toContain('diagram.png')
  expect(document.body.textContent).toContain('docs')

  unmount(component)
  target.remove()
})

it('FieldChooserLink filter prop hides rejected items in the chooser and blocks url entry', async () => {
  const target = document.createElement('div')
  document.body.appendChild(target)
  const component = mount(Harness, {
    target,
    props: { urlEntry: true, filter: async item => item.name !== 'syllabus.pdf' }
  })
  flushSync()
  const store = component.getStore()

  const selectbutton = Array.from(target.querySelectorAll('button')).find(b => b.textContent.includes('Select'))
  selectbutton.click()
  for (let i = 0; i < 5; i++) await settle(30)
  expect(document.body.textContent).not.toContain('syllabus.pdf')
  expect(document.body.textContent).toContain('diagram.png')

  const input = target.querySelector('input[type="text"]')
  input.value = '/assets/syllabus.pdf'
  input.dispatchEvent(new InputEvent('input'))
  await settle(400) // url entry is debounced 300ms
  expect(get(store).data.doc).toBeUndefined()

  unmount(component)
  target.remove()
})

function mountUploader (acceptMime) {
  const target = document.createElement('div')
  document.body.appendChild(target)
  const component = mount(UploadUI, {
    target,
    props: { title: 'Upload to /docs', folder, acceptMime, uploader: async () => [] }
  })
  flushSync()
  return { target, component }
}

function pickFile (name, type) {
  const input = document.querySelector('input[type="file"]')
  Object.defineProperty(input, 'files', { value: [new File(['x'], name, { type })], configurable: true })
  input.dispatchEvent(new Event('change'))
  flushSync()
  return input
}

it('UploadUI acceptMime flags disallowed files and blocks the upload', async () => {
  const { target, component } = mountUploader(['application/pdf'])

  const input = pickFile('diagram.png', 'image/png')
  // the acceptance list doubles as the file picker's accept attribute
  expect(input.getAttribute('accept')).toBe('application/pdf')
  expect(document.body.textContent).toContain('File type not allowed')
  const uploadbutton = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Upload'))
  expect(uploadbutton.disabled).toBe(true)

  unmount(component)
  target.remove()
})

it('UploadUI acceptMime allows matching files, including by wildcard', async () => {
  const { target, component } = mountUploader(['application/pdf', 'image/*'])

  pickFile('diagram.png', 'image/png')
  expect(document.body.textContent).not.toContain('File type not allowed')
  const uploadbutton = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Upload'))
  expect(uploadbutton.disabled).toBe(false)

  unmount(component)
  target.remove()
})

it('FieldChooserLink acceptMime prevents url entry of unacceptable assets', async () => {
  const target = document.createElement('div')
  document.body.appendChild(target)
  // intentionally odd casing: mime matching should be case-insensitive
  const component = mount(Harness, { target, props: { acceptMime: ['Application/PDF'], urlEntry: true } })
  flushSync()
  const store = component.getStore()

  const input = target.querySelector('input[type="text"]')
  expect(input).toBeDefined()

  input.value = '/assets/diagram.png'
  input.dispatchEvent(new InputEvent('input'))
  await settle(400) // url entry is debounced 300ms
  expect(get(store).data.doc).toBeUndefined()
  expect(target.textContent).toContain('Nothing will be saved')

  input.value = '/assets/syllabus.pdf'
  input.dispatchEvent(new InputEvent('input'))
  await settle(400)
  expect(get(store).data.doc).toBe('asset-pdf')

  unmount(component)
  target.remove()
})
