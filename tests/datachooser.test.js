import { flushSync, mount, unmount } from 'svelte'
import { expect, it } from 'vitest'
import { DataChooserStore } from '$lib'
import { demoDataChooserAPI } from '../src/demo/DemoDataChooserAPI'
import DataChooserDemo from '../src/routes/datachooser/+page.svelte'

async function settle (ms = 0) {
  await new Promise(resolve => setTimeout(resolve, ms))
  flushSync()
}

function mountDemo () {
  const target = document.createElement('div')
  document.body.appendChild(target)
  const component = mount(DataChooserDemo, { target })
  flushSync()
  return { target, component }
}

async function settleChooser () {
  // chooser init involves several awaits (getSources, tick, getChildren) and the
  // Tree waits on requestAnimationFrame before mounting rows
  for (let i = 0; i < 5; i++) await settle(30)
}

it('DataChooserStore passes the rootTemplateKey through to the client and applies the filter option', async () => {
  const calls = []
  const client = {
    getSources: async (rootTemplateKey) => { calls.push(['getSources', rootTemplateKey]); return [{ name: 'Global' }] },
    getChildren: async (rootTemplateKey, source, path) => { calls.push(['getChildren', rootTemplateKey, source, path]); return await demoDataChooserAPI.getChildren(rootTemplateKey, source, path) },
    findById: demoDataChooserAPI.findById.bind(demoDataChooserAPI)
  }
  const store = new DataChooserStore(client)
  await store.init({ rootTemplateKey: 'articledata', filter: itm => itm.id !== 'data-3' })
  const children = await store.fetchChildren()
  expect(calls).toEqual([['getSources', 'articledata'], ['getChildren', 'articledata', 'Global', '/']])
  expect(children.map(c => c.id)).toEqual(['datafolder-1'])
})

it('FieldDataChooser displays a preloaded item and an unknown-item state for unresolvable ids', async () => {
  const { target, component } = mountDemo()
  await settle(30)

  // preloaded id 'data-1' resolves to Welcome Week
  expect(document.body.textContent).toContain('Welcome Week')
  expect(document.body.textContent).toContain('/announcements/welcome-week')
  // preloaded id 'data-deleted' does not resolve but the value is preserved
  expect(document.body.textContent).toContain('Unknown Item (may have been deleted)')
  expect(document.body.textContent).toContain('data-deleted')
  expect(target.querySelector('aside pre').textContent).toContain('"brokenArticle": "data-deleted"')

  unmount(component)
  target.remove()
})

it('FieldDataChooser opens a chooser with source tabs and records the chosen item id', async () => {
  const { target, component } = mountDemo()
  await settle(30)

  const selectbutton = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Select Data'))
  expect(selectbutton).toBeDefined()
  selectbutton.click()
  await settleChooser()

  // articledata has two sources, so tabs should show; the dialog may portal outside the target
  expect(document.body.textContent).toContain('Global Data')
  expect(document.body.textContent).toContain('Sites')
  expect(document.body.textContent).toContain('announcements')
  expect(document.body.textContent).toContain('Campus History')
  expect(document.body.textContent).toContain('Select an item to preview it here.')

  const row = Array.from(document.querySelectorAll('div[role="treeitem"]')).find(n => n.textContent.includes('Campus History'))
  expect(row).toBeDefined()
  row.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  await settleChooser()

  // preview pane now shows the item details provided by the client
  expect(document.body.textContent).toContain('published')

  const choosebutton = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Choose')
  choosebutton.click()
  await settle(30)

  expect(target.querySelector('aside pre').textContent).toContain('"article": "data-3"')

  unmount(component)
  target.remove()
})

it('FieldDataChooser does not preview non-selectable containers', async () => {
  const { target, component } = mountDemo()
  await settle(30)

  const selectbutton = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Select Data'))
  selectbutton.click()
  await settleChooser()

  const row = Array.from(document.querySelectorAll('div[role="treeitem"]')).find(n => n.textContent.includes('announcements'))
  expect(row).toBeDefined()
  row.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  await settleChooser()

  // the folder is not selectable, so the preview placeholder remains
  expect(document.body.textContent).toContain('Select an item to preview it here.')
  // but its children loaded and are visible
  expect(document.body.textContent).toContain('Welcome Week')

  unmount(component)
  target.remove()
})

// entry buttons appear in field order: article (empty), color, publishedArticle, articleOnly
async function openChooserForField (index) {
  const buttons = Array.from(document.querySelectorAll('.dialog-data-chooser-entry button'))
    .filter(b => b.textContent.includes('Select Data'))
  buttons[index].click()
  await settleChooser()
  const rows = Array.from(document.querySelectorAll('div[role="treeitem"]'))
  const folderRow = rows.find(n => n.textContent.includes('announcements'))
  folderRow.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  await settleChooser()
}

it('FieldDataChooser filter prop hides rejected items in the chooser', async () => {
  const { target, component } = mountDemo()
  await settle(30)

  // the "published only" field filters out draft items
  await openChooserForField(2)

  expect(document.body.textContent).toContain('Welcome Week')
  expect(document.body.textContent).toContain('Commencement Ceremony')
  expect(document.body.textContent).not.toContain('Finals Schedule')

  unmount(component)
  target.remove()
})

it('FieldDataChooser filter prop can restrict choices to a templateKey', async () => {
  const { target, component } = mountDemo()
  await settle(30)

  // the "articles only" field filters out other data types but keeps containers
  await openChooserForField(3)

  expect(document.body.textContent).toContain('Welcome Week')
  expect(document.body.textContent).toContain('Finals Schedule')
  expect(document.body.textContent).not.toContain('Commencement Ceremony')

  unmount(component)
  target.remove()
})

it('FieldDataChooser remove button clears the form value', async () => {
  const { target, component } = mountDemo()
  await settle(30)

  expect(target.querySelector('aside pre').textContent).toContain('"preloadedArticle": "data-1"')
  const removebutton = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Remove'))
  expect(removebutton).toBeDefined()
  removebutton.click()
  await settle(30)

  expect(document.body.textContent).not.toContain('Welcome Week')
  expect(target.querySelector('aside pre').textContent).not.toContain('"preloadedArticle": "data-1"')

  unmount(component)
  target.remove()
})
