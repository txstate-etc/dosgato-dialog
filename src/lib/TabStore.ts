import { Store, derivedStore } from '@txstate-mws/svelte-store'
import type { ElementSize } from '@txstate-mws/svelte-components'
import { findIndex, randomid } from 'txstate-utils'
import type { IconifyIcon } from '@iconify/svelte'

export const TAB_CONTEXT = {}
export const TAB_NAME_CONTEXT = {}

export interface TabDef {
  name: string
  title?: string
  icon?: IconifyIcon
  required?: boolean
}

interface ITabStore extends ElementSize {
  current: number
  prevTitle?: string
  nextTitle?: string
  requireNext: boolean
  tabs: TabDef[]
  visited: Record<string, boolean>
  tabids: Record<string, string>
  panelids: Record<string, string>
  accordionOnMobile: boolean
  errorPaths: Record<string, string[] | undefined>
  hasError: Record<string, boolean | undefined>
}

function checkNext (v: ITabStore) {
  v.visited = { ...v.visited, [v.tabs[v.current].name]: true }
  v.prevTitle = v.current > 0 ? v.tabs[v.current - 1].title : undefined
  v.nextTitle = v.tabs.length - 1 > v.current ? v.tabs[v.current + 1].title : undefined
  v.requireNext = v.tabs.some((t, i) => t.required && !v.visited[t.name])
  return v
}

export class TabStore extends Store<ITabStore> {
  constructor (tabs: TabDef[], public initialTab?: string | undefined) {
    const current = findIndex(tabs, t => t.title === initialTab, 0) ?? 0
    super(checkNext({
      tabs,
      current,
      visited: {},
      requireNext: false,
      tabids: tabs.reduce((acc, curr) => ({ ...acc, [curr.name]: randomid() }), {}),
      panelids: tabs.reduce((acc, curr) => ({ ...acc, [curr.name]: randomid() }), {}),
      clientWidth: 1024,
      accordionOnMobile: true,
      errorPaths: {},
      hasError: {}
    }))
  }

  set (v: ITabStore) {
    v.tabids ??= {}
    v.panelids ??= {}
    for (const tab of v.tabs) {
      tab.title ??= tab.name
      v.tabids[tab.title] ??= randomid()
      v.panelids[tab.title] ??= randomid()
    }
    super.set(checkNext(v))
  }

  currentIdx () {
    return derivedStore(this, v => v.current)
  }

  currentName () {
    return derivedStore(this, v => v.tabs[v.current].name)
  }

  currentTitle () {
    return derivedStore(this, v => v.tabs[v.current].title)
  }

  currentTabId () {
    return derivedStore(this, v => v.tabids[v.tabs[v.current].name])
  }

  currentPanelId () {
    return derivedStore(this, v => v.panelids[v.tabs[v.current].name])
  }

  accordion () {
    return derivedStore(this, v => v.accordionOnMobile && v.clientWidth && v.clientWidth < 500)
  }

  left () {
    this.update(v => ({ ...v, current: Math.max(0, v.current - 1) }))
  }

  right () {
    this.update(v => ({ ...v, current: Math.min(v.tabs.length - 1, v.current + 1) }))
  }

  home () {
    this.update(v => ({ ...v, current: 0 }))
  }

  end () {
    this.update(v => ({ ...v, current: v.tabs.length - 1 }))
  }

  activate (idx: number) {
    this.update(v => ({ ...v, current: Math.min(v.tabs.length, Math.max(0, idx)) }))
  }

  activateName (name: string) {
    this.update(v => ({ ...v, current: findIndex(v.tabs, t => t.name === name) ?? v.current }))
  }

  notifyErrorPath (tabname: string, path: string) {
    this.update(v => {
      const errorPaths: Record<string, string[] | undefined> = {}
      for (const k of Object.keys(v.errorPaths)) errorPaths[k] = v.errorPaths[k]?.filter(p => p !== path)
      errorPaths[tabname] ??= []
      errorPaths[tabname]!.push(path)
      const hasError: Record<string, boolean> = {}
      for (const k of Object.keys(errorPaths)) hasError[k] = !!errorPaths[k]!.length
      return { ...v, errorPaths, hasError }
    })
  }

  notifyErrorPathGone (path: string) {
    this.update(v => {
      const errorPaths: Record<string, string[] | undefined> = {}
      for (const k of Object.keys(v.errorPaths)) errorPaths[k] = v.errorPaths[k]?.filter(p => p !== path)
      const hasError: Record<string, boolean> = {}
      for (const k of Object.keys(errorPaths)) hasError[k] = !!errorPaths[k]!.length
      return { ...v, errorPaths, hasError }
    })
  }
}
