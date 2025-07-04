<script lang="ts" generics="T extends TreeItemFromDB = TreeItemFromDB">
  import checkboxOutline from '@iconify-icons/mdi/checkbox-outline'
  import checkboxBlankOutline from '@iconify-icons/mdi/checkbox-blank-outline'
  import menuDown from '@iconify-icons/mdi/menu-down'
  import menuRight from '@iconify-icons/mdi/menu-right'
  import { modifierKey, ScreenReaderOnly } from '@txstate-mws/svelte-components'
  import type { Store } from '@txstate-mws/svelte-store'
  import { createEventDispatcher, getContext, onMount } from 'svelte'
  import { isNotBlank, toArray } from 'txstate-utils'
  import { Icon } from '$lib'
  import { type TreeStore, TREE_STORE_CONTEXT, type TypedTreeItem, type TreeItemFromDB, type TreeHeader, getHashId, lazyObserver } from './treestore'
  import LoadIcon from './LoadIcon.svelte'
  import TreeCell from './TreeCell.svelte'

  export let headers: TreeHeader<T>[]
  export let headerSizes: Store<string[]>
  export let nodeClass: ((itm: T) => string) | undefined = undefined
  export let item: TypedTreeItem<T>
  export let posinset: number
  export let setsize: number
  export let level: number
  export let next: TypedTreeItem<T> | undefined
  export let prev: TypedTreeItem<T> | undefined
  export let parent: TypedTreeItem<T> | undefined = undefined

  const store = getContext<TreeStore<T>>(TREE_STORE_CONTEXT)
  const { dragging, draggable, selectedUndraggable, selected, focused, copied, headerOverride } = store

  const dispatch = createEventDispatcher()
  let nodeelement: HTMLElement

  let userWantsCopy = false
  $: isSelected = $selected.has(item.id)
  $: showChildren = !!item.open && !!item.children?.length
  $: hashedId = getHashId(item.id)
  $: isDraggable = $draggable && ((isSelected && !$selectedUndraggable) || store.dragEligible([item], true) || store.dragEligible([item], false))
  $: dropZone = $dragging && store.dropEffect(item, false, userWantsCopy) !== 'none'
  $: dropDisabled = $dragging && !dropZone
  $: dropAbove = $dragging && store.dropEffect(item, true, userWantsCopy) !== 'none'
  $: inClipboard = $copied.has(item.id)

  function onKeyDown (e: KeyboardEvent) {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'x') {
        store.cut()
      } else if (e.key === 'c') {
        store.copy()
      } else if (e.key === 'v') {
        void store.paste()
      }
    } else if (e.key === 'Escape') {
      store.cancelCopy()
    }

    if (modifierKey(e) && !['Enter', ' '].includes(e.key)) return
    if (['Enter', ' '].includes(e.key)) {
      e.preventDefault()
      e.stopPropagation()
      if ($store.selected && $store.selected.size === 1 && $store.selected.has(item.id)) dispatch('choose', item)
      else {
        if (e.metaKey || e.altKey) {
          store.select(item, { clear: false, toggle: true })
        } else if (e.shiftKey) {
          shiftClick()
        } else {
          store.select(item, { clear: true })
        }
      }
    } else if (e.key === 'Escape') {
      store.deselect()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      e.stopPropagation()
      if (item.open && item.children?.length) {
        const child = item.children[0]
        store.focus(child)
      } else {
        void store.open(item)
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      e.stopPropagation()
      if (item.open) {
        store.close(item)
      } else if (parent) {
        store.focus(parent)
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      e.stopPropagation()
      const mynext = item.open && item.children?.length ? item.children[0] : next
      if (mynext) {
        store.focus(mynext)
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      e.stopPropagation()
      const anyprev = prev
      const myprev = anyprev?.open && anyprev.children?.length && (!parent || parent.children?.some(c => c.id === anyprev.id)) ? anyprev.children[anyprev.children.length - 1] : prev
      if (myprev) {
        store.focus(myprev)
      }
    } else if (e.key === '*') {
      e.preventDefault()
      e.stopPropagation()
      const toOpen = (parent ? parent.children : $store.rootItems) ?? []
      for (const child of toOpen) {
        store.open(child).catch(console.error)
      }
    }
  }

  function shiftClick () {
    const treenodes: HTMLElement[] = Array.from(store.treeElement?.querySelectorAll('div[role="treeitem"]') ?? [])
    const selectedNodes = treenodes.filter(n => n.matches('.selected'))
    const firstSelected = selectedNodes[0]
    if (!firstSelected || (selectedNodes.length === 1 && firstSelected === nodeelement)) {
      return store.select(item, { toggle: true })
    }
    const lastSelected = selectedNodes[selectedNodes.length - 1]
    const selectingdownward = firstSelected.compareDocumentPosition(nodeelement) === Node.DOCUMENT_POSITION_FOLLOWING
    let selecting = false
    store.deselect(false)
    for (const node of treenodes) {
      if (selectingdownward && node === firstSelected) selecting = true
      if (!selectingdownward && node === nodeelement) selecting = true
      if (selecting) store.selectById(node.getAttribute('data-id')!, { notify: false, toggle: false })
      if (selectingdownward && node === nodeelement) selecting = false
      if (!selectingdownward && node === lastSelected) selecting = false
    }
    store.trigger()
  }

  function onClick (e: MouseEvent) {
    if (e.button > 0) return
    e.preventDefault()
    e.stopPropagation()
    if (e.metaKey || e.altKey || e.ctrlKey) {
      store.select(item, { clear: false, toggle: true })
    } else if (e.shiftKey) {
      shiftClick()
    } else {
      const wasFocused = $store.focused?.id === item.id
      store.select(item, { clear: true, toggle: false })
      if (item.open && wasFocused && !item.loading) store.close(item)
      else if (!item.open) void store.open(item)
    }
  }
  function onCheckClick (e: MouseEvent) {
    if (e.button > 0) return
    e.preventDefault()
    e.stopPropagation()
    if (e.shiftKey) {
      shiftClick()
    } else {
      if (isSelected) dispatch('deselect', item)
      store.select(item, { clear: false, toggle: true })
    }
  }
  function onDblClick (e: MouseEvent) {
    if (modifierKey(e) || e.button > 0) return
    e.preventDefault()
    e.stopPropagation()
    if ($store.selected.size <= 1) dispatch('choose', item)
  }
  function onDragStart (e: DragEvent) {
    userWantsCopy = e.dataTransfer!.dropEffect === 'copy'
    e.dataTransfer!.effectAllowed = 'copyMove'
    e.dataTransfer!.setData('text/plain', item.id)
    store.dragStart(item)
  }
  function onDragOver (e: DragEvent) {
    userWantsCopy = e.dataTransfer!.dropEffect === 'copy'
    if (dropZone) {
      e.preventDefault()
      e.dataTransfer!.dropEffect = store.dropEffect(item, false, userWantsCopy)
    }
    return !dropZone
  }
  function onDragOverAbove (e: DragEvent) {
    userWantsCopy = e.dataTransfer!.dropEffect === 'copy'
    if (dropAbove) {
      e.preventDefault()
      e.dataTransfer!.dropEffect = store.dropEffect(item, true, userWantsCopy)
    }
    return !dropAbove
  }
  let dragOver = 0
  let dragOverAbove = 0
  async function onDrop (e: DragEvent) {
    e.preventDefault()
    dragOver = 0
    return await store.drop(item, false, e.dataTransfer!.dropEffect === 'copy')
  }
  async function onDropAbove (e: DragEvent) {
    e.preventDefault()
    dragOverAbove = 0
    return await store.drop(item, true, e.dataTransfer!.dropEffect === 'copy')
  }
  function onDragEnter (e: DragEvent) {
    if (!dropZone) dragOver = 0
    else dragOver++
    onDragOver(e)
  }
  function onDragEnterAbove (e: DragEvent) {
    if (!dropAbove) dragOverAbove = 0
    else dragOverAbove++
    onDragOverAbove(e)
  }
  function onDragLeave (e: DragEvent) {
    if (!dropZone) dragOver = 0
    else dragOver--
  }
  function onDragLeaveAbove (e: DragEvent) {
    if (!dropAbove) dragOverAbove = 0
    else dragOverAbove--
  }

  let display = $focused && $focused.id === item.id
  onMount(() => {
    if ($focused && $focused.id === item.id) nodeelement.scrollIntoView({ block: 'center' })
    nodeelement.addEventListener('lazy', () => { display = true })
    lazyObserver!.observe(nodeelement)
    return () => lazyObserver!.unobserve(nodeelement)
  })

  $: if ($dragging) {
    dragOver = 0
    dragOverAbove = 0
  }
</script>
<li role="presentation">
  {#if dropAbove}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="drop-above"
      class:dragOverAbove
      on:dragenter={onDragEnterAbove}
      on:dragleave={onDragLeaveAbove}
      on:dragover={onDragOverAbove}
      on:drop={onDropAbove}
      style:left="{level + 1.3}em"
    ></div>
  {/if}
  <div
    id={hashedId}
    bind:this={nodeelement}
    class={['tree-node', nodeClass?.(item)].filter(isNotBlank).join(' ')}
    class:selected={isSelected}
    class:dragOver
    class:dropDisabled
    class:inClipboard
    role="treeitem"
    data-id={item.id}
    draggable={isDraggable}
    tabindex={$focused && $focused.id === item.id ? 0 : -1}
    aria-level={level}
    aria-posinset={posinset}
    aria-setsize={setsize}
    aria-selected={isSelected}
    aria-expanded={item.hasChildren ? item.open && !!item.children && !!item.children.length : undefined}
    aria-busy={item.loading}
    on:keydown={onKeyDown}
    on:click={onClick}
    on:dragstart={onDragStart}
    on:dragover={onDragOver}
    on:dragenter={onDragEnter}
    on:dragleave={onDragLeave}
    on:drop={onDrop}
    on:mousedown={e => { if (e.shiftKey) e.preventDefault() }}
    on:dblclick={onDblClick}
  >
  {#if display}
    <!-- keyboard users have modifier keys, they don't ever focus the checkbox -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="checkbox" on:click={onCheckClick}>
      <Icon icon={isSelected ? checkboxOutline : checkboxBlankOutline } width="1.15em" inline />
    </div>
    {#each headers as header, i (header.id)}
      <div
        class={(header.class ? toArray(header.class(item)) : []).concat([header.id, 'tree-cell']).join(' ')}
        style:width={$headerSizes?.[i] ?? '1px'}
        style:padding-left={i === 0 ? `calc(min(${(level - 1) * 1.6}em, ${(level - 1) * 2.7}vw) + 1.4em)` : undefined}
        class:left={i === 0}
      >
        {#if i === 0 && item.hasChildren}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <span class="arrow" on:click={onClick}><Icon icon={item.open ? menuDown : menuRight} width="1.5em" inline /></span>
        {/if}
        <TreeCell {header} {item} />
        {#if i === 0 && item.loading}
          <LoadIcon />
        {/if}
      </div>
    {/each}
    <ScreenReaderOnly>
      up down to navigate
      {#if item.hasChildren && showChildren}, left arrow to hide children{/if}
      {#if item.hasChildren && !showChildren}, right arrow to show children{/if}
      {#if $selected.size > 0}, command-enter to select multiple, shift-enter to select all from last selection{/if}
    </ScreenReaderOnly>
  {/if}
  </div>
  {#if showChildren && item.children}
    <ul role="group">
      {#each item.children as child, i (child.id)}
        <svelte:self
          item={child}
          {headers}
          {headerSizes}
          {nodeClass}
          posinset={i + 1}
          setsize={item.children.length}
          level={child.level}
          prev={i === 0 ? item : item.children[i - 1]}
          next={i === item.children.length - 1 ? next : item.children[i + 1]}
          parent={item}
          on:choose
          on:deselect
        />
      {/each}
    </ul>
  {/if}
</li>

<style>
  .tree-node {
    cursor: pointer;
    display: flex;
    align-items: center;
    border-bottom: var(--tree-border, 1px dashed #aaaaaa);
    width: 100%;
    overflow: hidden;
    min-height: calc(2.7em + 2px);
  }
  :global(.resizing) .tree-node {
    cursor: col-resize;
  }
  .tree-node > div {
    padding: 0.6em 0.5em;
  }
  .tree-node .checkbox {
    min-width: 1.5em;
    max-width: 1.5em;
    padding-left: 0.3em;
  }
  .tree-node > div.left {
    display: flex;
    align-items: center;
  }
  .tree-node > div.left .arrow {
    margin-left: -1.6em;
    margin-right: 0.1em;
  }
  .tree-node > div.left :global(.icon) {
    margin-right: 0.4em;
  }
  .tree-node.selected {
    background-color: var(--tree-selected, #f1f1f1);
    color: var(--tree-selected-text, inherit);
  }
  .tree-node.dragOver {
    background-color: var(--tree-droppable, #757575);
    color: var(--tree-droppable-text, white);
  }
  .tree-node.dropDisabled {
    opacity: 0.6;
  }
  .tree-node :global(svg) {
    display: block;
  }
  .drop-above {
    position: absolute;
    top: -3px;
    left: 0;
    width: 100%;
    height: 6px;
  }
  .drop-above.dragOverAbove {
    background-color: var(--tree-droppable, #757575);
  }
  li {
    position: relative;
  }
  ul {
    padding: 0;
    margin: 0;
    list-style: none;
  }
  .inClipboard {
    background-image: linear-gradient(90deg, #999999 50%, transparent 50%), linear-gradient(90deg, #999999 50%, transparent 50%), linear-gradient(0deg, #999999 50%, transparent 50%), linear-gradient(0deg, #999999 50%, transparent 50%);
    background-repeat: repeat-x, repeat-x, repeat-y, repeat-y;
    background-size: 15px 1px, 15px 1px, 1px 15px, 1px 15px;
    background-position: left top, right bottom, left bottom, right   top;
    animation: border-dance 1s infinite linear;
  }
  .tree-cell {
    text-overflow: ellipsis;
    overflow: hidden;
  }
  @keyframes border-dance {
    0% {
      background-position: left top, right bottom, left bottom, right   top;
    }
    100% {
      background-position: left 15px top, right 15px bottom , left bottom 15px , right   top 15px;
    }
  }
  @media (prefers-reduced-motion) {
    .inClipboard {
      animation: none;
    }
  }
</style>
