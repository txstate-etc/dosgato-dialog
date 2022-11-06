import { Store, derivedStore } from '@txstate-mws/svelte-store'
import type { ElementSize } from '@txstate-mws/svelte-components'
import { findIndex, randomid } from 'txstate-utils'
import type { IconifyIcon } from '@iconify/svelte'

export const TAB_CONTEXT = {}

interface TabDef {
  title: string
  icon?: IconifyIcon
}

interface ITabStore extends ElementSize {
  current?: number
  tabs: TabDef[]
  tabids: Record<string, string>
  panelids: Record<string, string>
}

export class TabStore extends Store<ITabStore> {
  constructor (tabs: TabDef[], public initialTab?: string | undefined) {
    super({
      tabs,
      current: findIndex(tabs, t => t.title === initialTab, 0),
      tabids: tabs.reduce((acc, curr) => ({ ...acc, [curr.title]: randomid() }), {}),
      panelids: tabs.reduce((acc, curr) => ({ ...acc, [curr.title]: randomid() }), {}),
      clientWidth: 1024
    })
  }

  currentTitle () {
    return derivedStore(this, v => v.tabs[v.current].title)
  }

  currentTabId () {
    return derivedStore(this, v => v.tabids[v.tabs[v.current].title])
  }

  currentPanelId () {
    return derivedStore(this, v => v.panelids[v.tabs[v.current].title])
  }

  accordion () {
    return derivedStore(this, v => v.clientWidth < 500)
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
}
