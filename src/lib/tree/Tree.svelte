<script lang="ts">
  import { Icon } from '$lib'

  import { resize, type ElementSize, PopupMenu, type PopupMenuItem } from '@txstate-mws/svelte-components'
  import { derivedStore, Store } from '@txstate-mws/svelte-store'
  import { afterUpdate, beforeUpdate, onDestroy, onMount, setContext, tick } from 'svelte'
  import dotsIcon from '@iconify-icons/ph/dots-three-outline-vertical-fill'
  import circleIcon from '@iconify-icons/ph/circle'
  import radioSelectedIcon from '@iconify-icons/ph/radio-button-fill'
  import { isNotBlank } from 'txstate-utils'
  import LoadIcon from './LoadIcon.svelte'
  import TreeNode from './TreeNode.svelte'
  import { getHashId, transformSearchable, TreeStore, TREE_STORE_CONTEXT } from './treestore'
  import type { DragEligibleFn, CopyHandlerFn, DropEffectFn, FetchChildrenFn, MoveHandlerFn, TreeHeader, TreeItemFromDB, SearchableType } from './treestore'

  type T = $$Generic<TreeItemFromDB>

  interface $$Events {
    choose: CustomEvent<T>
    deselect: CustomEvent<T>
  }

  export let headers: TreeHeader<T>[]
  export let searchable: SearchableType<T> = undefined
  export let filterable: SearchableType<T> = searchable
  export let filter = ''
  export let nodeClass: ((itm: T) => string) | undefined = undefined
  export let singleSelect: boolean | undefined = undefined
  export let enableResize = false
  /**
   * Takes the width of the tree, in pixels, and returns an array of TreeHeader IDs that should be
   * displayed at that screen width. Any headers whose ID is not returned will be added to a dropdown, which allows
   * the user to view them. The last ID returned by this function is the header that is replaced if the user chooses
   * to view a different header. The headers will always appear in the order in which they are defined in the headers prop.
   */
  export let responsiveHeaders: ((treeWidth: number) => string[]) | undefined = undefined
  /**
   * this `itemType` prop is here for typescript only
   *
   * it will allow users to specify T
   *
   * we are able to determine T from the store prop, but not everyone will use the store prop
   */
  export const itemType: T | undefined = undefined
  export let fetchChildren: FetchChildrenFn<T> | undefined = undefined
  export let dragEligible: DragEligibleFn<T> | undefined = undefined
  export let moveHandler: MoveHandlerFn<T> | undefined = undefined
  export let copyHandler: CopyHandlerFn<T> | undefined = undefined
  export let dropEffect: DropEffectFn<T> | undefined = undefined
  export let store = new TreeStore<T>(fetchChildren!, { copyHandler, dragEligible, dropEffect, moveHandler })
  if (searchable) store.searchableFn = transformSearchable(searchable)
  if (filterable) store.filterableFn = transformSearchable(filterable)
  setContext(TREE_STORE_CONTEXT, store)
  const { filteredRootItems, headerOverride } = store

  let checkboxelement: HTMLElement
  const headerelements: HTMLElement[] = []
  let showMoreButton: HTMLButtonElement
  const treeWidth = new Store<ElementSize>({})

  // Need to keep track of which headers are shown or hidden and which is selected
  let shownHeaders: TreeHeader<T>[] = headers
  let hiddenHeaders: TreeHeader<T>[] = []
  let selectedHeader: TreeHeader<T> | undefined = undefined
  let selectedHeaderValue: string

  function updateShownHeaders () {
    if (typeof responsiveHeaders === 'function') {
      shownHeaders = []
      hiddenHeaders = []
      const shown = responsiveHeaders($treeWidth.clientWidth ?? 1024)
      if (selectedHeader && !shown.includes(selectedHeader.id)) {
        shown[shown.length - 1] = selectedHeader.id
      }
      for (const h of headers) {
        if (shown.includes(h.id)) {
          shownHeaders.push(h)
        } else {
          hiddenHeaders.push(h)
        }
      }
      selectedHeaderValue = shown[shown.length - 1]
      if (hiddenHeaders.length) {
        const hideable = headers.find(h => h.id === selectedHeaderValue)
        if (hideable) hiddenHeaders.push(hideable)
      }
    }
  }

  function calcHeaderSizes () {
    updateShownHeaders()
    const headerSizes: string[] = []
    let totalFixed = checkboxelement?.offsetWidth ?? 0
    if (hiddenHeaders.length) totalFixed += (showMoreButton?.offsetWidth ?? 0)
    for (let i = 0; i < shownHeaders.length; i++) {
      const header = shownHeaders[i]
      if (header.fixed || $headerOverride[header.id]) {
        headerSizes[i] = $headerOverride[header.id] ?? header.fixed
        totalFixed += headerelements[i]?.offsetWidth ?? 0
      }
    }
    const remainingWidth = ($treeWidth.clientWidth ?? 1024) - totalFixed
    const growHeaders = shownHeaders.filter((h, i) => !h.fixed && !$headerOverride[h.id])
    const totalGrowShares = growHeaders.reduce((sum, h) => sum + (h.grow ?? 1), 0)
    for (let i = 0; i < shownHeaders.length; i++) {
      const header = shownHeaders[i]
      if (!header.fixed && !$headerOverride[header.id] && headerelements[i]?.offsetWidth) {
        headerSizes[i] = `${remainingWidth * (header.grow ?? 1) / totalGrowShares}px`
      }
    }
    return headerSizes
  }
  const headerSizes = derivedStore([headerOverride, treeWidth], calcHeaderSizes)

  $: store.singleSelect = singleSelect

  function onDragEnd () {
    store.update(v => ({ ...v, dragging: false }))
  }

  let search = ''
  let searchTimer = 0
  $: store.filter(filter)
  function onKeyUp (e) {
    if (!store.searchableFn) return
    if (e.key.length === 1) {
      search += e.key.toLocaleLowerCase()
      const searchItems = $store.focused?.parent ? $store.focused.parent.children : $store.rootItems
      const newFocus = searchItems?.find(itm => store.searchableFn!(itm).some(str => str.toLocaleLowerCase().startsWith(search)))
      if (newFocus) store.focus(newFocus)
      clearTimeout(searchTimer)
      searchTimer = setTimeout(() => { search = '' }, 4000)
    } else if (e.key === 'Backspace') {
      search = search.substring(0, search.length - 1)
    } else if (e.key === 'Escape') {
      search = ''
    }
  }

  let dragtargetid: string | undefined
  let rightoftargetid: string | undefined
  let widthStart: number
  let width2Start: number
  let mouseStart: number
  function headerDragStart (header: TreeHeader<T>, idx: number) {
    return (e: MouseEvent | TouchEvent) => {
      if (!enableResize) return
      const dragtarget = headerelements[idx]
      const rightoftarget = headerelements.find((e, i) => i > idx && e.isConnected)
      if (!dragtarget?.isConnected || !rightoftarget) dragtargetid = undefined
      else {
        e.preventDefault()
        dragtargetid = header.id
        rightoftargetid = rightoftarget.getAttribute('id') ?? undefined
        widthStart = dragtarget.clientWidth
        width2Start = rightoftarget.clientWidth
        mouseStart = 'touches' in e ? e.touches[0].screenX : e.screenX
      }
    }
  }

  function headerDrag (e: MouseEvent | TouchEvent) {
    if ('touches' in e && e.touches?.length > 1) return
    if (dragtargetid && rightoftargetid) {
      const screenX = 'touches' in e ? e.touches[0].screenX : e.screenX
      store.setHeaderOverride(dragtargetid, `${widthStart - (mouseStart - screenX)}px`)
      store.setHeaderOverride(rightoftargetid, `${width2Start + (mouseStart - screenX)}px`)
    }
  }

  function headerDragEnd () {
    dragtargetid = undefined
    rightoftargetid = undefined
  }

  function headerDragReset () {
    store.resetHeaderOverride()
  }

  let mounted = false
  onMount(async () => {
    document.addEventListener('dragend', onDragEnd)
    headerSizes.set(calcHeaderSizes()) // seems to need a kick on first mount
    await new Promise(resolve => requestAnimationFrame(resolve))
    // need to wait long enough for headers to redraw before trying to mount the rows
    await new Promise(resolve => requestAnimationFrame(resolve))
    mounted = true
    await store.refresh()
  })
  onDestroy(() => {
    if (typeof document !== 'undefined') document.removeEventListener('dragend', onDragEnd)
  })
  let hadFocus = false
  beforeUpdate(() => {
    hadFocus = !!store.treeElement?.contains(document.activeElement)
  })
  afterUpdate(() => {
    if ($store.focused?.id) {
      const el = document.getElementById(getHashId($store.focused.id))
      if (el && hadFocus) {
        if (el !== document.activeElement) el.focus()
      }
    }
  })
  $: myRootItemIds = $store && $filteredRootItems
  $: myRootItems = $store?.rootItems?.filter(r => myRootItemIds.has(r.id)) ?? []

  async function selectHeader (selected: PopupMenuItem) {
    selectedHeader = headers.find(h => h.id === selected.value)
    updateShownHeaders()
    store.resetHeaderOverride()
    const headersizes = shownHeaders.map(h => h.fixed ? h.fixed : '')
    headerSizes.set(headersizes)
    await tick()
    headerSizes.set(calcHeaderSizes())
  }
</script>

<svelte:window on:mouseup={headerDragEnd} />
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="tree-header" class:resizing={!!dragtargetid} use:resize={{ store: treeWidth }} on:mouseup={headerDragEnd} on:touchend={headerDragEnd} on:mousemove={dragtargetid ? headerDrag : undefined} on:touchmove={dragtargetid ? headerDrag : undefined}>
  <div class="checkbox" bind:this={checkboxelement} aria-hidden="true">&nbsp;</div>
  {#each shownHeaders as header, i (header.label)}
    <div bind:this={headerelements[i]} id={header.id} class="tree-header-cell {header.id}" aria-hidden="true" style:width={$headerOverride[header.id] ?? $headerSizes?.[i]} style:padding-left={i === 0 ? '1.4em' : undefined}>{header.label}{#if i === 0 && $store.loading}<LoadIcon />{/if}{#if i === 0 && isNotBlank(search)}&nbsp;(searching: {search}){/if}</div>
    {#if enableResize && i !== shownHeaders.length - 1}<div class="tree-separator {header.id}" on:mousedown={headerDragStart(header, i)} on:touchstart={headerDragStart(header, i)} on:dblclick={headerDragReset}>&nbsp;</div>{/if}
  {/each}
  {#if hiddenHeaders.length}
    <div class="button-wrapper">
      <button bind:this={showMoreButton} type='button'><Icon icon={dotsIcon} hiddenLabel="View other columns"/></button>
      <PopupMenu bind:value={selectedHeaderValue} items={hiddenHeaders.map(h => ({ value: h.id, label: h.label }))} buttonelement={showMoreButton} on:change={async e => { await selectHeader(e.detail) }} let:item menuContainerClass="hideable-container" menuClass="hideable-headers" menuItemSelectedClass="selected-header">
        {#if 'value' in item}
          <Icon icon={'value' in item && item.value === selectedHeaderValue ? radioSelectedIcon : circleIcon} inline width="1.1em"/>
          {item.label}
        {/if}
      </PopupMenu>
    </div>
  {/if}
</div>
{#if mounted && myRootItems?.length}
  <!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
  <ul bind:this={store.treeElement} role="tree" class:resizing={!!dragtargetid} on:mousemove={dragtargetid ? headerDrag : undefined} on:touchmove={dragtargetid ? headerDrag : undefined} on:mouseup={headerDragEnd} on:touchend={headerDragEnd} on:keyup={onKeyUp}>
    {#each myRootItems as item, i (item.id)}
      <TreeNode
        {item}
        headers={shownHeaders}
        {headerSizes}
        {nodeClass}
        posinset={i + 1}
        setsize={myRootItems.length}
        level={item.level}
        prev={myRootItems[i - 1]}
        next={myRootItems[i + 1]}
        on:choose
        on:deselect
      />
    {/each}
  </ul>
{/if}

<style>
  .tree-header {
    display: flex;
    align-items: center;
    background-color: var(--tree-head-bg, #757575);
    color: var(--tree-head-text, white);
    position: sticky;
    top: 0;
    left: 0;
    z-index: 1;
    font-size: 0.9em;
  }
  .tree-header.resizing {
    cursor: col-resize;
  }
  .tree-header > .tree-header-cell {
    padding: 0.4em 0.3em;
  }
  .tree-header > .tree-separator {
    position: relative;
    width: 4px;
    margin-left: -4px;
    padding: 0.4em 0;
    cursor: col-resize;
  }
  .tree-header > .tree-separator:before {
    content: ' ';
    position: absolute;
    left: 1px;
    top: 0;
    width: 2px;
    height: 100%;
    background-color: var(--tree-head-text, white);
  }
  :global([data-eq~="650px"]) .tree-header {
    font-size: 0.8em;
  }
  .checkbox {
    min-width: 1.5em;
    max-width: 1.5em;
  }
  ul {
    padding: 0;
    margin: 0;
    list-style: none;
    font-size: 0.9em;
  }
  :global([data-eq~="650px"]) ul {
    font-size: 0.8em;
  }
  .button-wrapper {
    display: flex;
    justify-content: flex-end;
    flex-grow: 2;
  }
  .button-wrapper button {
    background: transparent;
    color: var(--tree-head-text, white);
    border: 0;
  }
  :global(.hideable-container .hideable-headers) {
    margin: 0;
    padding: 0.4em;
    background: white;
    border: 1px solid slategray;
    border-radius: 5px;
    min-width: 10em;
    max-height: 20em;
    overflow-y: auto;
  }
  :global(div.hideable-container ul.hideable-headers li[role="option"]) {
    padding-left: 0;
    color: black;
    padding: 0.5em;
    font-size: 1.1em;
  }
</style>
