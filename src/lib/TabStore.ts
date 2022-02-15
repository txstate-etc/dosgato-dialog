import { Store, derivedStore } from '@txstate-mws/svelte-store'
import type { ElementSize } from '@txstate-mws/svelte-components'
import { randomid } from 'txstate-utils'

export const TAB_CONTEXT = {}

interface ITabStore extends ElementSize {
  current?: number
  tabs: string[]
  tabids: Record<string, string>
  panelids: Record<string, string>
}

export class TabStore extends Store<ITabStore> {
  constructor (public initialTab: string|undefined, tabs: string[] = []) {
    super({
      current: typeof initialTab === 'undefined' ? undefined : tabs.findIndex(t => t === initialTab),
      tabs,
      tabids: tabs.reduce((acc, curr) => ({ ...acc, [curr]: randomid() }), {}),
      panelids: tabs.reduce((acc, curr) => ({ ...acc, [curr]: randomid() }), {}),
      clientWidth: 1024
    })
  }

  registerTab (name: string) {
    this.update(v => {
      const foundidx = v.tabs.findIndex(t => t === name)
      const idx = foundidx === -1 ? v.tabs.length : foundidx
      let current = v.current
      if (name === this.initialTab) {
        current = idx
        this.initialTab = undefined
      }
      current ??= idx
      if (foundidx !== -1) return { ...v, current }
      return {
        ...v,
        current,
        tabs: [...v.tabs, name],
        tabids: { ...v.tabids, [name]: randomid() },
        panelids: { ...v.panelids, [name]: randomid() }
      }
    })
  }

  unregisterTab (name: string) {
    this.update(v => {
      const idx = v.tabs.findIndex(t => t === name)
      const current = (idx === v.current && idx === v.tabs.length - 1) ? v.tabs.length - 2 : v.current
      return {
        ...v,
        current,
        tabs: [...v.tabs].splice(idx, 1)
      }
    })
  }

  currentTitle () {
    return derivedStore(this, v => v.tabs[v.current])
  }

  currentTabId () {
    return derivedStore(this, v => v.tabids[v.tabs[v.current]])
  }

  currentPanelId () {
    return derivedStore(this, v => v.panelids[v.tabs[v.current]])
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
