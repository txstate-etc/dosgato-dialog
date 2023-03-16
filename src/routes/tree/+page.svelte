<script lang="ts">
  import { Tree, type TreeItemFromDB } from '$lib'
  import { bytesToHuman, randomid } from 'txstate-utils'

  interface TestItem extends TreeItemFromDB {
    name: string
    size: number
    type: string
    modified: Date
    dbChildren: this[]
  }

  const rootItems: TestItem[] = []
  for (let i = 0; i < 1000; i++) {
    const itm: TestItem = { id: randomid(), hasChildren: true, name: randomid(), size: Math.floor(10000 * Math.random()), type: 'page', modified: new Date(), dbChildren: [] }
    const numChildren = 1 + Math.floor(9 * Math.random())
    for (let i = 0; i < numChildren; i++) {
      itm.dbChildren.push({ id: randomid(), hasChildren: false, name: randomid(), size: Math.floor(10000 * Math.random()), type: 'page', modified: new Date(), dbChildren: [] })
    }
    rootItems.push(itm)
  }

  async function fetchChildren (item?: TestItem) {
    if (!item) return rootItems
    return item.dbChildren
  }
</script>
<Tree {fetchChildren} headers={[
  { id: 'name', label: 'Name', get: 'name' },
  { id: 'size', label: 'Size', render: itm => bytesToHuman(itm.size) },
  { id: 'type', label: 'Type', get: 'type' },
  { id: 'modified', label: 'Modified', render: itm => itm.modified.toISOString() }
]}/>
