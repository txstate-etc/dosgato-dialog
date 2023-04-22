import { ActiveStore, derivedStore, Store } from '@txstate-mws/svelte-store'
import type { IconifyIcon } from '@iconify/svelte'
import type { SvelteComponent } from 'svelte'
import { derived } from 'svelte/store'
import { hashid, isBlank, isNotBlank, keyby, toArray } from 'txstate-utils'

export const TREE_STORE_CONTEXT = {}

export interface TreeItemFromDB {
  id: string
  hasChildren?: boolean
}

export interface TreeItem<T extends TreeItemFromDB> extends TreeItemFromDB {
  level: number
  parent?: TypedTreeItem<T>
  loading?: boolean
  open?: boolean
  children?: TypedTreeItem<T>[]
}

export type TypedTreeItem<T extends TreeItemFromDB> = TreeItem<T> & T

export interface ITreeStore<T extends TreeItemFromDB> {
  loading?: boolean
  rootItems?: TypedTreeItem<T>[]
  itemsById: Record<string, TypedTreeItem<T> | undefined>
  focused?: TypedTreeItem<T>
  selected: Map<string, TypedTreeItem<T>>
  selectedItems: TypedTreeItem<T>[]
  copied: Map<string, TypedTreeItem<T>>
  cut?: boolean
  draggable: boolean
  selectedUndraggable?: boolean
  dragging: boolean
  headerWidthOverrides: Record<string, string>
}

export type FetchChildrenFn<T extends TreeItemFromDB> = (item?: TypedTreeItem<T>) => Promise<T[]>
export type DragEligibleFn<T extends TreeItemFromDB> = (selectedItems: TypedTreeItem<T>[], userWantsCopy: boolean) => boolean
export type DropEffectFn<T extends TreeItemFromDB> = (selectedItems: TypedTreeItem<T>[], dropTarget: TypedTreeItem<T>, above: boolean, userWantsCopy: boolean) => 'move' | 'copy' | 'none'
export type MoveHandlerFn<T extends TreeItemFromDB> = (selectedItems: TypedTreeItem<T>[], dropTarget: TypedTreeItem<T>, above: boolean) => boolean | Promise<boolean>
export type CopyHandlerFn<T extends TreeItemFromDB> = (selectedItems: TypedTreeItem<T>[], dropTarget: TypedTreeItem<T>, above: boolean, userWantsRecursive: boolean | undefined) => boolean | Promise<boolean>
export type SearchableFn<T extends TreeItemFromDB> = (item: TypedTreeItem<T>) => string[]

export interface TreeHeader<T extends TreeItemFromDB> {
  id: string
  label: string
  fixed?: string
  grow?: number
  icon?: { icon: IconifyIcon, label?: string } | ((item: TypedTreeItem<T>) => { icon: IconifyIcon, label?: string } | undefined)
  get?: string
  render?: (item: TypedTreeItem<T>) => string
  component?: SvelteComponent
  class?: (item: TypedTreeItem<T>) => string | string[]
}

export class TreeStore<T extends TreeItemFromDB> extends ActiveStore<ITreeStore<T>> {
  public treeElement?: HTMLElement

  public rootItems = derivedStore(this, 'rootItems')
  public filterTerm = new Store('')
  public filteredRootItems = derived([this.rootItems, this.filterTerm], ([rootItems, filter]) => {
    if (!this.searchableFn || !rootItems?.length || isBlank(filter)) return this.value.rootItems
    const ret: TypedTreeItem<T>[] = []
    const newselected: TypedTreeItem<T>[] = []
    let foundfocus = false
    for (const itm of this.value.rootItems ?? []) {
      let found = false
      for (const val of this.searchableFn(itm)) {
        if (val.toLocaleLowerCase().startsWith(filter)) found = true
      }
      if (found) {
        if (this.value.selected.has(itm.id)) newselected.push(itm)
        if (this.value.focused?.id === itm.id) foundfocus = true
        ret.push(itm)
      }
    }
    if (!foundfocus) this.focus(ret[0])
    this.setSelected(newselected, {})
    return ret
  })

  public draggable = derivedStore(this, v => v.draggable && !v.loading)
  public dragging = derivedStore(this, 'dragging')
  public selectedUndraggable = derivedStore(this, 'selectedUndraggable')
  public selected = derivedStore(this, 'selected')
  public focused = derivedStore(this, 'focused')
  public copied = derivedStore(this, 'copied')
  public headerOverride = derivedStore(this, 'headerWidthOverrides')

  public moveHandler?: MoveHandlerFn<T>
  public copyHandler?: CopyHandlerFn<T>
  public dragEligibleHandler?: DragEligibleFn<T>
  public dropEffectHandler?: DropEffectFn<T>
  public searchableFn?: SearchableFn<T>
  public singleSelect?: boolean

  private refreshPromise?: Promise<void>

  constructor (
    public fetchChildren: FetchChildrenFn<T>,
    { moveHandler, copyHandler, dragEligible, dropEffect, searchableFn, singleSelect }: {
      moveHandler?: MoveHandlerFn<T>
      copyHandler?: CopyHandlerFn<T>
      dragEligible?: DragEligibleFn<T>
      dropEffect?: DropEffectFn<T>
      searchableFn?: SearchableFn<T>
      singleSelect?: boolean
    } = {}
  ) {
    super({ itemsById: {}, selected: new Map(), selectedItems: [], copied: new Map(), dragging: false, draggable: !!moveHandler, headerWidthOverrides: {} })
    this.moveHandler = moveHandler
    this.copyHandler = copyHandler
    this.dragEligibleHandler = dragEligible
    this.dropEffectHandler = dropEffect
    this.searchableFn = searchableFn
    this.singleSelect = singleSelect
  }

  async visit (item: TypedTreeItem<T>, cb: (item: TypedTreeItem<T>) => Promise<void>) {
    await cb(item)
    await Promise.all((item.children ?? []).map(async child => { await this.visit(child, cb) }))
  }

  visitSync (item: TypedTreeItem<T>, cb: (item: TypedTreeItem<T>) => void) {
    cb(item)
    for (const child of item.children ?? []) this.visitSync(child, cb)
  }

  addLookup (items: TypedTreeItem<T>[]) {
    for (const item of items) {
      this.visitSync(item, itm => {
        this.value.itemsById[itm.id] = itm
        if (this.value.selected.has(itm.id)) this.value.selected.set(itm.id, itm)
      })
    }
    this.cleanSelected()
  }

  cleanSelected () {
    for (const selected of this.value.selected.values()) {
      if (!this.value.itemsById[selected.id]) this.value.selected.delete(selected.id)
    }
    this.determineDraggable()
  }

  determineDraggable () {
    this.value.selectedItems = Array.from(this.value.selected.values())
    this.value.selectedUndraggable = !this.dragEligible(this.value.selectedItems, true) && !this.dragEligible(this.value.selectedItems, false)
  }

  trigger () {
    this.set(this.value)
  }

  async fetch (item?: TypedTreeItem<T>) {
    const children = await this.fetchChildren(item) as unknown as TypedTreeItem<T>[]
    for (const child of children) {
      child.level = (item?.level ?? 0) + 1
      child.parent = item
    }
    return children
  }

  async #refresh (item?: TypedTreeItem<T>, skipNotify = false) {
    if (item) item.loading = true
    else this.value.loading = true
    this.trigger()
    try {
      const children = await this.fetch(item)
      // re-open any open children
      await Promise.all(children.map(async (child: TypedTreeItem<T>) => {
        await this.visit(child, async (child) => {
          child.open = this.value.itemsById[child.id]?.open
          if (child.open) {
            child.children = await this.fetch(child)
            child.hasChildren = child.children.length > 0
            if (!child.hasChildren) child.open = false
          }
        })
      }))

      if (item) {
        this.visitSync(item, itm => { if (itm.id !== item.id) this.value.itemsById[itm.id] = undefined })
        item.children = children
        item.hasChildren = children.length > 0
        if (!item.hasChildren) item.open = false
      } else {
        this.value.itemsById = {}
        this.value.rootItems = children
      }
      this.addLookup(children)

      // if any selected items disappeared in the refresh, we need to remove them from the selection map
      this.cleanSelected()

      // if the focused item disappeared in the refresh, we need to replace it,
      // as without a focus the tree becomes invisible to keyboard nav
      if (!this.value.itemsById[this.value.focused?.id ?? '']) this.focus(this.value.selectedItems.slice(-1)[0] ?? this.value.rootItems?.[0], true)
    } finally {
      if (item) item.loading = false
      this.value.loading = false
      if (!skipNotify) this.trigger()
    }
  }

  async refresh (item?: TypedTreeItem<T>, skipNotify = false) {
    this.refreshPromise ??= this.#refresh(item, skipNotify)
    await this.refreshPromise
    this.refreshPromise = undefined
  }

  filter (term: string | undefined) {
    this.filterTerm.set(term?.toLocaleLowerCase() ?? '')
  }

  focus (item: TypedTreeItem<T> | undefined, notify = true) {
    this.value.focused = item
    if (notify) this.trigger()
  }

  select (item: TypedTreeItem<T>, { clear = false, notify = true, toggle = false }) {
    const selected = this.isSelected(item)
    const numSelected = this.value.selected.size
    if (this.singleSelect) clear = true
    if (clear) {
      this.value.selected.clear()
      this.focus(item, false)
    }
    if (toggle && selected && (!clear || numSelected === 1)) this.value.selected.delete(item.id)
    else this.value.selected.set(item.id, item)
    this.determineDraggable()
    if (notify) this.trigger()
  }

  setSelected (items: TypedTreeItem<T>[], { notify = true }) {
    this.value.selected.clear()
    for (const itm of items) this.value.selected.set(itm.id, itm)
    if (notify) this.trigger()
  }

  selectById (id: string, { clear = false, notify = true, toggle = false }) {
    const item = this.value.itemsById[id]
    if (item) this.select(item, { clear, notify, toggle })
  }

  deselect (notify = true) {
    this.value.selected.clear()
    this.determineDraggable()
    if (notify) this.trigger()
  }

  isSelected (item: TypedTreeItem<T>) {
    return this.value.selected.has(item.id)
  }

  async open (item: TypedTreeItem<T>, notify = true) {
    if (item.open || item.hasChildren === false) return
    await this.openAndRefresh(item, notify)
  }

  async openAndRefresh (item: TypedTreeItem<T>, notify = true) {
    await this.refresh(item, true)
    item.open = !!item.children?.length
    if (notify) this.trigger()
  }

  close (item: TypedTreeItem<T>) {
    for (const child of item.children ?? []) this.value.itemsById[child.id] = undefined
    this.cleanSelected()
    item.children = undefined
    item.open = false
    this.trigger()
  }

  async toggle (item: TypedTreeItem<T>) {
    if (item.open) this.close(item)
    else await this.open(item)
  }

  async viewUnder (item?: TypedTreeItem<T>) {
    if (item) await this.open(item)
    this.trigger()
  }

  dragStart (item: TypedTreeItem<T>) {
    if (this.value.dragging || !this.value.draggable) return
    if (!this.value.selected.has(item.id)) {
      this.select(item, { clear: true, notify: false })
    }
    this.value.dragging = true
    this.trigger()
  }

  protected async _drop (item: TypedTreeItem<T>, droppedItems: Map<string, TypedTreeItem<T>>, above: boolean, userWantsCopy: boolean, userWantsRecursive: boolean | undefined) {
    const dropEffect = this._dropEffect(item, droppedItems, above, userWantsCopy)
    if (dropEffect === 'none') return false
    this.value.dragging = false
    this.value.loading = true
    this.trigger()
    const selectedItems = Array.from(droppedItems.values())
    const commonparent = this.findCommonParent([...selectedItems, item])
    this.focus(item, false)
    try {
      const result = dropEffect === 'move'
        ? await this.moveHandler?.(selectedItems, item, above)
        : await this.copyHandler?.(selectedItems, item, above, userWantsRecursive)
      await this.openAndRefresh(item)
      await this.refresh(commonparent)
      return result
    } catch (e: any) {
      console.error(e)
    } finally {
      this.update(v => ({ ...v, loading: false }))
    }
    return true
  }

  async drop (item: TypedTreeItem<T>, above: boolean, userWantsCopy) {
    const ret = await this._drop(item, this.value.selected, above, userWantsCopy, undefined)
    return ret
  }

  collectAncestors (item: TypedTreeItem<T>) {
    const ret: TypedTreeItem<T>[] = []
    let itm = item
    while (itm.parent) {
      ret.push(itm.parent)
      itm = itm.parent
    }
    return ret
  }

  root (item: TypedTreeItem<T>) {
    let root = item
    while (root.parent) root = root.parent
    return root
  }

  findCommonParent (items: TypedTreeItem<T>[]) {
    if (items.length <= 1) return
    const [first, ...rest] = items
    const ancestors = [first, ...this.collectAncestors(first)]
    const lookup = keyby(ancestors, 'id')
    const depthById = ancestors.reduce((depthById, a, i) => { depthById[a.id] = i; return depthById }, {})
    let idx = -1
    for (const item of rest) {
      const itemAncestors = this.collectAncestors(item)
      const firstcommon = itemAncestors.find(a => lookup[a.id])
      if (!firstcommon) return
      const found = depthById[firstcommon.id]
      if (found > idx) idx = found
    }
    return ancestors[idx]
  }

  dragEligible (selectedItems: TypedTreeItem<T>[], userWantsCopy: boolean) {
    return !this.dragEligibleHandler || this.dragEligibleHandler(selectedItems, userWantsCopy)
  }

  protected _dropEffect (item: TypedTreeItem<T>, droppedItems: Map<string, TypedTreeItem<T>>, above: boolean, userWantsCopy: boolean) {
    const handlerAnswer = this.dropEffectHandler?.(Array.from(droppedItems.values()), item, above, userWantsCopy) ?? 'move'
    if (handlerAnswer === 'none') return 'none'
    if (handlerAnswer === 'move') {
      // I could make the user's dropEffectHandler check this, but it's pretty universal that you
      // can't move a thing into itself or one of its own descendants
      // and it would be super weird to just automagically turn it into a copy, not to mention it would
      // mean placing it back on itself would feel like canceling the move but make a copy instead
      if (droppedItems.has(item.id)) return 'none'
      for (const ancestor of this.collectAncestors(item)) {
        if (droppedItems.has(ancestor.id)) return 'none'
      }
    }
    if (handlerAnswer === 'move' && !this.moveHandler) return 'none'
    if (handlerAnswer === 'copy' && !this.copyHandler) return 'none'
    return handlerAnswer
  }

  dropEffect (item: TypedTreeItem<T>, above: boolean, userWantsCopy: boolean) {
    return this._dropEffect(item, this.value.selected, above, userWantsCopy)
  }

  cut () {
    if (!this.cutEligible()) return
    this.value.copied = new Map(this.value.selected)
    this.value.cut = true
    this.trigger()
  }

  copy () {
    if (!this.copyEligible()) return
    this.value.copied = new Map(this.value.selected)
    this.value.cut = false
    this.trigger()
  }

  cutEligible () {
    return this.moveHandler && this.dragEligible(this.value.selectedItems, false)
  }

  copyEligible () {
    return this.copyHandler && this.dragEligible(this.value.selectedItems, true)
  }

  cancelCopy () {
    this.value.copied = new Map()
    this.value.cut = undefined
    this.trigger()
  }

  pasteEligible (above = false) {
    return this.value.copied.size && (this.value.cut ? this.pasteEffect(above) === 'move' : this.pasteEffect(above) !== 'none')
  }

  pasteEffect (above = false) {
    return this._dropEffect(this.value.selectedItems[0], this.value.copied, above, !this.value.cut)
  }

  async paste (above = false, userWantsRecursive = false) {
    if (this.pasteEffect(above) === 'none') return
    const copied = this.value.copied
    const cut = this.value.cut
    this.value.copied = new Map()
    this.value.cut = undefined
    return await this._drop(this.value.selectedItems[0], copied, above, !cut, userWantsRecursive)
  }

  setHeaderOverride (id: string, width: string) {
    this.value.headerWidthOverrides[id] = `max(20px, ${width})`
    this.trigger()
  }

  resetHeaderOverride () {
    this.value.headerWidthOverrides = {}
    this.trigger()
  }
}

export const hashedIds: Record<string, string> = {}
export function getHashId (str: string) {
  hashedIds[str] ??= hashid(str)
  return hashedIds[str]
}

const lazyEvent = typeof CustomEvent !== 'undefined' ? new CustomEvent('lazy') : undefined
export const lazyObserver = typeof IntersectionObserver !== 'undefined'
  ? new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.dispatchEvent(lazyEvent!)
        lazyObserver!.unobserve(entry.target)
      }
    }
  }, { rootMargin: '500px' })
  : undefined

export type SearchableType<T> = keyof T | (keyof T)[] | ((item: T) => string | string[]) | undefined
export function transformSearchable<T> (searchable: SearchableType<T>): undefined | ((itm: T) => string[]) {
  return searchable == null
    ? undefined
    : (
        typeof searchable === 'function'
          ? (itm: T) => toArray((searchable as any)(itm)).filter(isNotBlank)
          : (
              Array.isArray(searchable)
                ? (itm: T) => searchable.map(k => itm[k] as string).filter(isNotBlank)
                : (itm: T) => isNotBlank(itm[searchable] as string | undefined) ? [itm[searchable] as string] : []
            )
      )
}
