import calendarBlank from '@iconify-icons/ph/calendar-blank'
import globeIcon from '@iconify-icons/ph/globe'
import folderIcon from '@iconify-icons/ph/folder'
import newspaperIcon from '@iconify-icons/ph/newspaper'
import { encodePreviewImage, encodePreviewLink, type DataChooserClient, type DataChooserItem, type DataChooserSource } from '$lib/datachooser/DataChooserAPI'

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
        folder: true,
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
        childCount: 2,
        icon: siteIcon,
        children: [
          { id: 'data-4', name: 'faculty-spotlight', label: 'Faculty Spotlight', path: '/history-dept/faculty-spotlight', templateKey: 'articledata', hasChildren: false, icon: articleIcon },
          {
            id: 'datafolder-2',
            name: 'newsletters',
            path: '/history-dept/newsletters',
            hasChildren: true,
            childCount: 2,
            folder: true,
            icon: { icon: folderIcon, label: 'folder' },
            children: [
              { id: 'data-6', name: 'spring-gala', label: 'Spring Gala', path: '/history-dept/newsletters/spring-gala', templateKey: 'eventdata', hasChildren: false, icon: eventIcon, published: 'published' },
              { id: 'data-7', name: 'draft-issue', label: 'Draft Issue', path: '/history-dept/newsletters/draft-issue', templateKey: 'articledata', hasChildren: false, icon: articleIcon, published: 'unpublished' }
            ]
          }
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
      { id: 'color-1', name: 'maroon', label: 'Maroon', path: '/maroon', templateKey: 'colordata', hasChildren: false },
      { id: 'color-2', name: 'gold', label: 'Gold', path: '/gold', templateKey: 'colordata', hasChildren: false }
    ]
  }
}

/**
 * full data payloads, fetched one at a time when an item is previewed; Campus
 * History nests deep enough to demonstrate the preview's depth limit - the
 * `citations` array sits inside a level-4 object, so it renders as an ellipsis
 */
const fullData: Record<string, any> = {
  'data-1': {
    title: 'Welcome Week',
    intro: 'Kick off the semester with a full week of events.',
    author: { name: 'Riley Byrd', email: 'rbyrd@example.edu' },
    tags: ['students', 'events']
  },
  'data-2': {
    title: 'Finals Schedule',
    intro: 'Exam times for every section.'
  },
  'data-3': {
    title: 'Campus History',
    // datetimes display as ISO8601 in the browser's timezone, whether they come
    // in as UTC strings or Date objects; date-only strings pass through as-is
    updatedAt: '2026-03-04T15:30:00Z',
    archivedAt: new Date('2026-06-01T12:00:00Z'),
    established: '1899-05-10',
    // a real client would resolve its internal link format into these encoded strings
    attachment: encodePreviewLink('https://example.edu/campus-history.pdf', 'History PDF'),
    heroImage: encodePreviewImage("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='40'%3E%3Crect width='80' height='40' fill='%23501214'/%3E%3C/svg%3E", 'campus banner'),
    sections: [
      {
        heading: 'Founding',
        subsections: [
          { id: 5, name: 'An Item', citations: [{ url: 'https://example.edu/archives' }] }
        ]
      }
    ]
  },
  'data-4': {
    title: 'Faculty Spotlight',
    author: { name: 'Alex Chen' }
  },
  'color-1': { hex: '#501214', usage: ['primary', 'headers'] },
  'color-2': { hex: '#6a5638', usage: ['accents'] }
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

  async getPreviewData (rootTemplateKey: string, item: DataChooserItem) {
    return fullData[item.id]
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
