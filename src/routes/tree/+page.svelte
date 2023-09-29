<script lang="ts">
  import { Tree, TreeStore, type TreeItemFromDB } from '$lib'
  import { bytesToHuman, randomid } from 'txstate-utils'
  import circleIcon from '@iconify-icons/mdi/circle'
  import squareIcon from '@iconify-icons/mdi/square'
  import triangleIcon from '@iconify-icons/mdi/triangle'

  interface TestItem extends TreeItemFromDB {
    name: string
    size: number
    type: string
    modified: Date
    dbChildren: this[]
    status: string
  }

  const statusIcon = {
    published: triangleIcon,
    modified: circleIcon,
    unpublished: squareIcon
  }

  const statuses = ['published', 'modified', 'unpublished']

  function randomNumber (min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  const rootItems: TestItem[] = []
  for (let i = 0; i < 2000; i++) {
    const itm: TestItem = { id: randomid(), hasChildren: true, name: randomid(), size: Math.floor(10000 * Math.random()), type: 'page', modified: new Date(), dbChildren: [], status: statuses[randomNumber(0, 2)] }
    const numChildren = 1 + Math.floor(9 * Math.random())
    for (let i = 0; i < numChildren; i++) {
      itm.dbChildren.push({ id: randomid(), hasChildren: false, name: randomid(), size: Math.floor(10000 * Math.random()), type: 'page', modified: new Date(), dbChildren: [], status: statuses[randomNumber(0, 2)] })
    }
    rootItems.push(itm)
  }

  async function fetchChildren (item?: TestItem) {
    if (!item) return rootItems
    return item.dbChildren
  }

  async function copyHandler (selectedItems: TestItem[], dropTarget: TestItem, above: boolean, userWantsRecursive: boolean = false) {
    alert(`copying: ${userWantsRecursive ? 'recursive' : 'not recursive'}`)
    return true
  }

  function dropEffect (selectedItems: TestItem[], dropTarget: TestItem, above: boolean, userWantsCopy: boolean) {
    return 'copy' as const // won't let me just return copy... :-(
  }

  const treestore = new TreeStore(fetchChildren, { copyHandler, dropEffect })
  let showtree = true
  let filter = ''
</script>
<div>
  <input type="text" on:keyup={e => { filter = e.currentTarget?.value ?? '' }}/>
  <button type="button" on:click={() => { showtree = !showtree }}>Toggle</button>
  <button type="button" on:click={() => { treestore.copy() }}>Copy</button>
  <button type="button" on:click={() => { treestore.copy(true) }}>Copy With Chlidren</button>
  <button type="button" on:click={() => { void treestore.paste(false, $treestore.copyRecursive) }}>Paste</button>
</div>
{#if showtree}
  <Tree store={treestore} headers={[
    { id: 'name', label: 'Name', get: 'name' },
    { id: 'size', label: 'Size', render: itm => bytesToHuman(itm.size) },
    { id: 'type', label: 'Type', get: 'type' },
    { id: 'status', label: 'Status', fixed: '4em', icon: item => ({ icon: statusIcon[item.status], label: item.status }) },
    { id: 'modified', label: 'Modified', render: itm => itm.modified.toISOString() }
  ]} searchable="name" filterable={itm => [itm.name, bytesToHuman(itm.size)]} {filter} enableResize />
{/if}

<style>
  div {
    position: fixed;
    top: 1em;
    right: 1em;
    z-index: 10000;
  }
</style>
