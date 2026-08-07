import calendarBlank from '@iconify-icons/ph/calendar-blank'
import globeIcon from '@iconify-icons/ph/globe'
import folderIcon from '@iconify-icons/ph/folder'
import newspaperIcon from '@iconify-icons/ph/newspaper'
import type { DataChooserClient, DataChooserItem, DataChooserSource } from '$lib/datachooser/DataChooserAPI'

interface StoredDataItem extends Omit<DataChooserItem, 'source'> {
  children?: StoredDataItem[]
}

const siteIcon = { icon: globeIcon, label: 'site' }
const articleIcon = { icon: newspaperIcon, label: 'article' }
const eventIcon = { icon: calendarBlank, label: 'event' }

const data: Record<string, Record<string, StoredDataItem[]>> = {
  articledata: {
    Global: [
      {
        id: 'datafolder-1',
        name: 'announcements',
        path: '/announcements',
        hasChildren: true,
        childCount: 3,
        icon: { icon: folderIcon, label: 'folder' },
        children: [
          { id: 'data-1', name: 'welcome-week', label: 'Welcome Week', path: '/announcements/welcome-week', templateKey: 'articledata', hasChildren: false, icon: articleIcon, published: 'published' },
          { id: 'data-2', name: 'finals-schedule', label: 'Finals Schedule', path: '/announcements/finals-schedule', templateKey: 'articledata', hasChildren: false, icon: articleIcon, published: 'unpublished' },
          { id: 'data-5', name: 'commencement', label: 'Commencement Ceremony', path: '/announcements/commencement', templateKey: 'eventdata', hasChildren: false, icon: eventIcon, published: 'modified' }
        ]
      },
      { id: 'data-3', name: 'campus-history', label: 'Campus History', path: '/campus-history', templateKey: 'articledata', hasChildren: false, icon: articleIcon, published: 'published' }
    ],
    Sites: [
      {
        id: 'site-1',
        name: 'history-dept',
        label: 'History Department',
        path: '/history-dept',
        hasChildren: true,
        childCount: 1,
        icon: siteIcon,
        children: [
          { id: 'data-4', name: 'faculty-spotlight', label: 'Faculty Spotlight', path: '/history-dept/faculty-spotlight', templateKey: 'articledata', hasChildren: false, icon: articleIcon }
        ]
      },
      {
        id: 'site-2',
        name: 'math-dept',
        label: 'Math Department',
        path: '/math-dept',
        hasChildren: false,
        childCount: 0,
        icon: siteIcon
      }
    ]
  },
  colordata: {
    Global: [
      { id: 'color-1', name: 'maroon', label: 'Maroon', path: '/maroon', templateKey: 'colordata', hasChildren: false, details: [{ label: 'Hex', value: '#501214' }] },
      { id: 'color-2', name: 'gold', label: 'Gold', path: '/gold', templateKey: 'colordata', hasChildren: false, details: [{ label: 'Hex', value: '#6a5638' }] }
    ]
  }
}

class DemoDataChooserAPI implements DataChooserClient {
  async getSources (rootTemplateKey: string): Promise<DataChooserSource[]> {
    return Object.keys(data[rootTemplateKey] ?? {}).map(name => ({ name, label: name === 'Global' ? 'Global Data' : name }))
  }

  findItems (rootTemplateKey: string, source: string, path: string): StoredDataItem[] {
    if (path === '/') return data[rootTemplateKey]?.[source] ?? []
    const parts = path.substring(1).split('/')
    let items = data[rootTemplateKey]?.[source] ?? []
    let item: StoredDataItem | undefined
    for (const part of parts) {
      item = items.find(i => i.name === part)
      if (!item) throw new Error(`path ${path} not found in source ${source}`)
      items = item.children ?? []
    }
    return items
  }

  async getChildren (rootTemplateKey: string, source: string, path: string): Promise<DataChooserItem[]> {
    const children = this.findItems(rootTemplateKey, source, path)
    return children.map(c => ({ ...c, source }))
  }

  collectItems (items: StoredDataItem[], source: string): DataChooserItem[] {
    const ret: DataChooserItem[] = []
    for (const item of items) {
      ret.push({ ...item, source })
      if (item.children?.length) ret.push(...this.collectItems(item.children, source))
    }
    return ret
  }

  async findById (rootTemplateKey: string, id: string): Promise<DataChooserItem | undefined> {
    for (const [t, sources] of Object.entries(data)) {
      for (const [source, items] of Object.entries(sources)) {
        const found = this.collectItems(items, source).find(i => i.id === id)
        if (found) return found
      }
    }
    return undefined
  }
}

export const demoDataChooserAPI = new DemoDataChooserAPI()
