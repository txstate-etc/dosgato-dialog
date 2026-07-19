import { flushSync, mount, unmount } from 'svelte'
import { get } from 'svelte/store'
import { expect, it } from 'vitest'
import Harness from './ChooserMimeHarness.svelte'

async function settle (ms = 0) {
  await new Promise(resolve => setTimeout(resolve, ms))
  flushSync()
}

function mountHarness (props = {}) {
  const target = document.createElement('div')
  document.body.appendChild(target)
  const component = mount(Harness, { target, props })
  flushSync()
  return { target, component }
}

/** open the chooser dialog and select the /docs folder in the tree */
async function openChooserAndSelectFolder (target) {
  const selectbutton = Array.from(target.querySelectorAll('button')).find(b => b.textContent.includes('Select'))
  selectbutton.click()
  // chooser init involves several awaits (getSources, tick, getChildren) and the
  // Tree waits on requestAnimationFrame before mounting rows
  for (let i = 0; i < 5; i++) await settle(30)

  const foldernode = Array.from(document.querySelectorAll('.tree-node')).find(n => n.textContent.includes('docs'))
  expect(foldernode).toBeDefined()
  foldernode.click()
  for (let i = 0; i < 3; i++) await settle(30)
}

/** the dialog section whose header matches, so we can tell the uploader's buttons from the chooser's */
function findDialog (headerText) {
  return Array.from(document.querySelectorAll('section')).find(s => s.querySelector('header')?.textContent.includes(headerText))
}

function pickFile (name, type) {
  const input = document.querySelector('input[type="file"]')
  Object.defineProperty(input, 'files', { value: [new File(['file contents'], name, { type })], configurable: true })
  input.dispatchEvent(new Event('change'))
  flushSync()
  return input
}

it('uploading within a FieldChooserLink inserts the file, refreshes the tree, and the upload is choosable', async () => {
  const { target, component } = mountHarness({ acceptMime: ['application/pdf'] })
  await openChooserAndSelectFolder(target)

  // footer Upload button enables once a folder that accepts uploads is selected
  const uploadbutton = document.querySelector('button.upload')
  expect(uploadbutton).toBeDefined()
  expect(uploadbutton.disabled).toBe(false)
  uploadbutton.click()
  flushSync()

  const uploaddialog = findDialog('Upload to /docs')
  expect(uploaddialog).toBeDefined()
  // acceptMime should flow through the Chooser into the uploader's file input
  const input = pickFile('report.pdf', 'application/pdf')
  expect(input.getAttribute('accept')).toBe('application/pdf')
  expect(uploaddialog.textContent).toContain('report.pdf')

  const submitbutton = uploaddialog.querySelector('button.primary')
  expect(submitbutton.disabled).toBe(false)
  submitbutton.click()
  for (let i = 0; i < 5; i++) await settle(30)

  // the mock client received the selected folder and inserted the file into its data structure
  const calls = component.getUploadCalls()
  expect(calls.length).toBe(1)
  expect(calls[0].folder.id).toBe('folder-1')
  expect(calls[0].files.map(f => f.name)).toEqual(['report.pdf'])
  expect(component.getFolderContents('/docs').map(a => a.name)).toEqual(['report.pdf'])

  // the uploader closed and the tree refreshed to show the new asset
  expect(findDialog('Upload to /docs')).toBeUndefined()
  const newnode = Array.from(document.querySelectorAll('.tree-node')).find(n => n.textContent.includes('report.pdf'))
  expect(newnode).toBeDefined()

  // the uploaded asset can be chosen and lands in the form data
  newnode.click()
  await settle(30)
  const choosebutton = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Choose' && !b.disabled)
  expect(choosebutton).toBeDefined()
  choosebutton.click()
  for (let i = 0; i < 3; i++) await settle(30)
  expect(get(component.getStore()).data.doc).toBe('asset-report.pdf')

  unmount(component)
  target.remove()
})

it('cancelling an upload in progress aborts it and leaves the mock data unchanged', async () => {
  const { target, component } = mountHarness({ hangUploads: true })
  await openChooserAndSelectFolder(target)

  document.querySelector('button.upload').click()
  flushSync()
  const uploaddialog = findDialog('Upload to /docs')
  pickFile('report.pdf', 'application/pdf')
  uploaddialog.querySelector('button.primary').click()
  flushSync()

  // upload is hung: the progress bar is showing
  expect(document.querySelector('progress')).not.toBeNull()
  expect(component.getUploadCalls().length).toBe(1)

  // cancel fires the abort signal, which rejects the hung upload and closes the uploader
  uploaddialog.querySelector('button.cancel').click()
  for (let i = 0; i < 3; i++) await settle(30)

  expect(findDialog('Upload to /docs')).toBeUndefined()
  expect(component.getFolderContents('/docs')).toEqual([])
  // the chooser itself stays open
  expect(document.body.textContent).toContain('syllabus.pdf')

  unmount(component)
  target.remove()
})
