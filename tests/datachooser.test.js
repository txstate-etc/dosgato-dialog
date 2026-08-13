import { flushSync, mount, unmount } from 'svelte'
import { expect, it } from 'vitest'
import { DataChooserStore, dedupeSelections, describeSelections } from '$lib'
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
  // no lookahead at the root level, even with a filter active
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

  // preview pane now shows the publish status provided by the client
  expect(document.body.textContent).toContain('Status')
  expect(document.body.textContent).toContain('Published')

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

it('FieldDataChooser publishedOnly prop hides unpublished items but keeps modified ones', async () => {
  const { target, component } = mountDemo()
  await settle(30)

  await openChooserForField(2)

  // Welcome Week is published and Commencement is modified (still has a live
  // published version); Finals Schedule is unpublished and should be hidden
  expect(document.body.textContent).toContain('Welcome Week')
  expect(document.body.textContent).toContain('Commencement Ceremony')
  expect(document.body.textContent).not.toContain('Finals Schedule')

  unmount(component)
  target.remove()
})

it('DataChooserStore publishedOnly hides unpublished items, keeps items without a status, and composes with filter', async () => {
  const store = new DataChooserStore(demoDataChooserAPI)
  await store.init({ rootTemplateKey: 'articledata', publishedOnly: true, filter: itm => itm.id !== 'data-3' })
  const roots = await store.fetchChildren()
  // the announcements folder has no publish status, so it passes; campus-history
  // is published but rejected by the composed filter
  expect(roots.map(c => c.id)).toEqual(['datafolder-1'])
  const children = await store.fetchChildren({ ...roots[0], level: 0 })
  expect(children.map(c => c.id)).toEqual(['data-1', 'data-5'])
})

it('DataChooserStore recomputes hasChildren and childCount post-filter when a container is opened', async () => {
  const articleFilter = itm => itm.templateKey == null || itm.templateKey === 'articledata'
  async function openHistoryDept (store) {
    const historyDept = (await store.fetchChildren()).find(c => c.id === 'site-1')
    return await store.fetchChildren({ ...historyDept, level: 1 })
  }

  // root-level containers keep the client-reported arrow as a performance tradeoff
  const rootstore = new DataChooserStore(demoDataChooserAPI)
  await rootstore.init({ rootTemplateKey: 'articledata', filter: itm => itm.templateKey == null })
  const announcements = (await rootstore.fetchChildren()).find(c => c.id === 'datafolder-1')
  expect(announcements.hasChildren).toBe(true)

  // opening a container corrects the arrows of the folders inside it: the
  // newsletters folder's only surviving child is draft-issue
  const articlestore = new DataChooserStore(demoDataChooserAPI)
  await articlestore.init({ rootTemplateKey: 'articledata', initialSource: 'Sites', filter: articleFilter })
  const newsletters = (await openHistoryDept(articlestore)).find(c => c.id === 'datafolder-2')
  expect(newsletters.hasChildren).toBe(true)
  expect(newsletters.childCount).toBe(1)

  // publishedOnly composes: draft-issue is unpublished, spring-gala is filtered,
  // so the folder loses its arrow entirely
  const publishedstore = new DataChooserStore(demoDataChooserAPI)
  await publishedstore.init({ rootTemplateKey: 'articledata', initialSource: 'Sites', publishedOnly: true, filter: articleFilter })
  const newsletters2 = (await openHistoryDept(publishedstore)).find(c => c.id === 'datafolder-2')
  expect(newsletters2.hasChildren).toBe(false)
  expect(newsletters2.childCount).toBe(0)

  // with no filtering active there is no lookahead and client-reported counts stand
  const plainstore = new DataChooserStore(demoDataChooserAPI)
  await plainstore.init({ rootTemplateKey: 'articledata', initialSource: 'Sites' })
  const newsletters3 = (await openHistoryDept(plainstore)).find(c => c.id === 'datafolder-2')
  expect(newsletters3.hasChildren).toBe(true)
  expect(newsletters3.childCount).toBe(2)
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

it('dedupeSelections drops selections beneath a selected folder', () => {
  const folder = { id: 'f1', name: 'a', path: '/a', source: 'Global', folder: true, hasChildren: true }
  const nestedFolder = { id: 'f2', name: 'b', path: '/a/b', source: 'Global', folder: true, hasChildren: true }
  const child = { id: 'd1', name: 'c', path: '/a/b/c', source: 'Global', templateKey: 'x', hasChildren: false }
  const outside = { id: 'd2', name: 'd', path: '/d', source: 'Global', templateKey: 'x', hasChildren: false }
  const otherSource = { id: 'd3', name: 'c', path: '/a/c', source: 'Sites', templateKey: 'x', hasChildren: false }
  expect(dedupeSelections([folder, nestedFolder, child, outside, otherSource]).map(itm => itm.id)).toEqual(['f1', 'd2', 'd3'])
  // without the folder, the nested folder wins instead
  expect(dedupeSelections([nestedFolder, child, outside]).map(itm => itm.id)).toEqual(['f2', 'd2'])
})

it('describeSelections summarizes folders, items, and unknowns', () => {
  const folder = { id: 'f1', name: 'a', path: '/a', source: 'Global', folder: true, hasChildren: true }
  const item = { id: 'd1', name: 'b', path: '/b', source: 'Global', templateKey: 'x', hasChildren: false }
  const broken = { broken: true, id: 'gone' }
  expect(describeSelections([folder, item, item, broken])).toBe('1 folder, 2 items, 1 unknown item')
  expect(describeSelections([item])).toBe('1 item')
  expect(describeSelections([folder, folder])).toBe('2 folders')
})

it('DataChooserStore only treats folders as choosable when selectableFolders is on', async () => {
  const folderItem = { id: 'f1', name: 'a', path: '/a', source: 'Global', folder: true, hasChildren: true }
  const siteItem = { id: 's1', name: 's', path: '/s', source: 'Sites', hasChildren: true }
  const dataItem = { id: 'd1', name: 'b', path: '/b', source: 'Global', templateKey: 'x', hasChildren: false }

  const store = new DataChooserStore(demoDataChooserAPI)
  await store.init({ rootTemplateKey: 'articledata' })
  expect(store.isChoosable(dataItem)).toBe(true)
  expect(store.isChoosable(folderItem)).toBe(false)

  const folderstore = new DataChooserStore(demoDataChooserAPI)
  await folderstore.init({ rootTemplateKey: 'articledata', selectableFolders: true })
  expect(folderstore.isChoosable(dataItem)).toBe(true)
  expect(folderstore.isChoosable(folderItem)).toBe(true)
  // sites and other non-folder containers stay unchoosable
  expect(folderstore.isChoosable(siteItem)).toBe(false)

  // the disable option only ever sees items; folder selection is governed
  // solely by selectableFolders, even when the option disables everything
  const customstore = new DataChooserStore(demoDataChooserAPI)
  await customstore.init({ rootTemplateKey: 'articledata', selectableFolders: true, disable: () => true })
  expect(customstore.isChoosable(dataItem)).toBe(false)
  expect(customstore.isChoosable(folderItem)).toBe(true)
})

it('DataChooserStore filter wins over disable: a doubly-rejected item disappears', async () => {
  const store = new DataChooserStore(demoDataChooserAPI)
  await store.init({
    rootTemplateKey: 'articledata',
    filter: itm => itm.templateKey !== 'eventdata',
    disable: itm => itm.templateKey === 'eventdata'
  })
  const announcements = (await store.fetchChildren()).find(c => c.id === 'datafolder-1')
  const children = await store.fetchChildren({ ...announcements, level: 1 })
  // commencement (eventdata) is rejected by both; it is hidden, not shown disabled
  expect(children.map(c => c.id)).toEqual(['data-1', 'data-2'])
})

function findRow (text) {
  return Array.from(document.querySelectorAll('div[role="treeitem"]')).find(n => n.textContent.includes(text))
}

function clickCheckbox (text) {
  const row = findRow(text)
  expect(row).toBeDefined()
  row.querySelector('.checkbox').dispatchEvent(new MouseEvent('click', { bubbles: true }))
}

function clickArrow (text) {
  const row = findRow(text)
  expect(row).toBeDefined()
  row.querySelector('.arrow').dispatchEvent(new MouseEvent('click', { bubbles: true }))
}

function formData (target) {
  return JSON.parse(target.querySelector('aside pre').textContent)
}

// among the empty multiple fields, "articles" comes first and "articlesWithFolders" second
async function openMultipleChooser (index) {
  const buttons = Array.from(document.querySelectorAll('.dialog-data-chooser-entry button'))
    .filter(b => b.textContent.includes('Select Data'))
  // the four single fields with entry buttons come first
  buttons[4 + index].click()
  await settleChooser()
}

it('FieldDataChooser multiple records ids; collapsing a folder discards the selections beneath it', async () => {
  const { target, component } = mountDemo()
  await settle(30)

  await openMultipleChooser(0)

  // folders are not choosable here, so their checkboxes are disabled and inert
  expect(findRow('announcements').querySelector('.checkbox').classList.contains('disabled')).toBe(true)
  clickCheckbox('announcements')
  await settleChooser()
  expect(findRow('announcements').getAttribute('aria-selected')).toBe('false')
  expect(document.body.textContent).not.toContain('folder selected')

  // the arrow expands the folder without disturbing the selection
  clickArrow('announcements')
  await settleChooser()
  clickCheckbox('Welcome Week')
  await settleChooser()
  expect(document.body.textContent).toContain('1 item selected')
  clickCheckbox('Campus History')
  await settleChooser()
  expect(document.body.textContent).toContain('2 items selected')

  // collapsing the folder discards the selections beneath it
  clickArrow('announcements')
  await settleChooser()
  expect(findRow('Welcome Week')).toBeUndefined()
  expect(document.body.textContent).toContain('1 item selected')

  // re-expanding does not bring the selection back
  clickArrow('announcements')
  await settleChooser()
  expect(findRow('Welcome Week').getAttribute('aria-selected')).toBe('false')
  clickCheckbox('Welcome Week')
  await settleChooser()
  expect(document.body.textContent).toContain('2 items selected')

  const choosebutton = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Choose')
  choosebutton.click()
  await settle(30)

  expect(formData(target).articles).toEqual(['data-3', 'data-1'])
  expect(document.body.textContent).toContain('2 items selected')

  unmount(component)
  target.remove()
})

it('FieldDataChooser multiple keeps selections from other sources while browsing', async () => {
  const { target, component } = mountDemo()
  await settle(30)

  await openMultipleChooser(0)

  clickArrow('announcements')
  await settleChooser()
  clickCheckbox('Welcome Week')
  await settleChooser()
  expect(document.body.textContent).toContain('1 item selected')

  // switching sources keeps the selection, counted but out of the tree
  const sitesTab = Array.from(document.querySelectorAll('[role="tab"]')).find(t => t.textContent.trim() === 'Sites')
  sitesTab.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  await settleChooser()
  expect(findRow('Welcome Week')).toBeUndefined()
  expect(document.body.textContent).toContain('1 item selected')

  clickArrow('History Department')
  await settleChooser()
  clickCheckbox('Faculty Spotlight')
  await settleChooser()
  expect(document.body.textContent).toContain('2 items selected')

  // switching back restores the stashed selection into the tree, expanded and checked
  const globalTab = Array.from(document.querySelectorAll('[role="tab"]')).find(t => t.textContent.trim() === 'Global Data')
  globalTab.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  await settleChooser()
  expect(findRow('Welcome Week').getAttribute('aria-selected')).toBe('true')
  expect(document.body.textContent).toContain('2 items selected')

  const choosebutton = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Choose')
  choosebutton.click()
  await settle(30)

  expect(formData(target).articles).toEqual(['data-4', 'data-1'])

  unmount(component)
  target.remove()
})

it('FieldDataChooser selectableFolders allows choosing a folder and dedupes selections beneath it', async () => {
  const { target, component } = mountDemo()
  await settle(30)

  await openMultipleChooser(1)

  // the folder is choosable now, so its checkbox is live
  expect(findRow('announcements').querySelector('.checkbox').classList.contains('disabled')).toBe(false)
  clickCheckbox('announcements')
  await settleChooser()
  expect(document.body.textContent).toContain('1 folder selected')

  clickArrow('announcements')
  await settleChooser()
  clickCheckbox('Welcome Week')
  await settleChooser()
  // the item beneath the selected folder is redundant and does not count
  expect(document.body.textContent).toContain('1 folder selected')

  const choosebutton = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Choose')
  choosebutton.click()
  await settle(30)

  expect(formData(target).articlesWithFolders).toEqual(['datafolder-1'])

  unmount(component)
  target.remove()
})

it('FieldDataChooser disable prop disables items without hiding them', async () => {
  const { target, component } = mountDemo()
  await settle(30)

  await openMultipleChooser(2)

  clickArrow('announcements')
  await settleChooser()

  // eventdata is ineligible: still visible, unlike the filter prop, but disabled and inert
  expect(findRow('Commencement Ceremony')).toBeDefined()
  expect(findRow('Commencement Ceremony').querySelector('.checkbox').classList.contains('disabled')).toBe(true)
  clickCheckbox('Commencement Ceremony')
  await settleChooser()
  expect(findRow('Commencement Ceremony').getAttribute('aria-selected')).toBe('false')
  // the chooser's running count only renders once something is chosen
  expect(document.querySelector('.selection-count')).toBeNull()

  // eligible items behave normally
  expect(findRow('Welcome Week').querySelector('.checkbox').classList.contains('disabled')).toBe(false)
  clickCheckbox('Welcome Week')
  await settleChooser()
  expect(document.querySelector('.selection-count').textContent).toBe('1 item selected')

  const choosebutton = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Choose')
  choosebutton.click()
  await settle(30)
  expect(formData(target).eligibleArticles).toEqual(['data-1'])

  unmount(component)
  target.remove()
})

it('FieldDataChooser multiple preload resolves ids and summarizes unknowns; editing drops them, cancelling keeps them', async () => {
  const { target, component } = mountDemo()
  await settle(30)

  // preloaded with data-1 and an unresolvable id
  expect(document.body.textContent).toContain('1 item, 1 unknown item selected')

  const editbutton = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Edit'))
  expect(editbutton).toBeDefined()
  editbutton.click()
  await settleChooser()

  // the resolvable selection is checked in the tree
  const row = findRow('Welcome Week')
  expect(row).toBeDefined()
  expect(row.getAttribute('aria-selected')).toBe('true')

  // cancelling preserves the unresolvable id; the chooser's Cancel is the last
  // one in the document since the outer FormDialog has its own
  const cancelbutton = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.trim() === 'Cancel').pop()
  cancelbutton.click()
  await settle(30)
  expect(formData(target).preloadedArticles).toEqual(['data-1', 'data-deleted'])
  expect(document.body.textContent).toContain('1 item, 1 unknown item selected')

  Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Edit')).click()
  await settleChooser()
  const choosebutton = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Choose')
  choosebutton.click()
  await settle(30)

  // confirming an edit drops the unresolvable id, since it cannot be shown in the chooser
  expect(formData(target).preloadedArticles).toEqual(['data-1'])
  expect(document.body.textContent).toContain('1 item selected')

  const removebutton = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Remove All'))
  removebutton.click()
  await settle(30)
  expect(formData(target).preloadedArticles).toBeUndefined()

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
