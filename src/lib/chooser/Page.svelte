<script lang="ts">
  import fileOutline from '@iconify-icons/mdi/file-outline.js'
  import fileSyncOutline from '@iconify-icons/mdi/file-sync-outline.js'
  import { modifierKey } from '@txstate-mws/svelte-components'
  import { createEventDispatcher, getContext } from 'svelte'
  import { hashid } from 'txstate-utils'
  import type { ChooserStore, UIPage, AnyUIItem } from './ChooserStore'
  import { CHOOSER_STORE_CONTEXT } from './ChooserStore'
  import Icon from '../Icon.svelte'

  export let page: UIPage
  export let level: number
  export let posinset: number
  export let setsize: number
  export let next: AnyUIItem|undefined
  export let prev: AnyUIItem|undefined
  export let parent: UIPage|undefined = undefined

  const store = getContext<ChooserStore>(CHOOSER_STORE_CONTEXT)
  $: open = page.open && page.children?.length
  $: nextlevel = level + 1
  $: id = hashid(page.id)
  $: haveFocus = $store.focus === page.id
  $: isPreview = $store.preview?.id === page.id

  const dispatch = createEventDispatcher()

  function onKeyDown (e: KeyboardEvent) {
    if (modifierKey(e)) return
    if (['Enter', ' '].includes(e.key)) {
      onClick(e)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      e.stopPropagation()
      if (page.open && page.children?.length) {
        const child = page.children[0]
        store.setFocus(child)
        document.getElementById(hashid(child.id)).focus()
      } else {
        store.open(page)
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      e.stopPropagation()
      if (page.open) {
        store.close(page)
      } else if (parent) {
        store.setFocus(parent)
        document.getElementById(hashid(parent.id)).focus()
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      e.stopPropagation()
      const mynext = open ? page.children[0] : next
      if (mynext) {
        store.setFocus(mynext)
        document.getElementById(hashid(mynext.id)).focus()
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      e.stopPropagation()
      const anyprev = prev as any
      const myprev = anyprev?.open && anyprev.children?.length && anyprev.path === page.path ? anyprev.children[anyprev.children.length - 1] : prev
      if (myprev) {
        store.setFocus(myprev)
        document.getElementById(hashid(myprev.id)).focus()
      }
    }
  }
  function onClick (e) {
    e.preventDefault()
    e.stopPropagation()
    // if the id was already the same as the one that was clicked, the user
    // has clicked it twice, so we should choose the item and end the modal
    if ($store.preview?.id === page.id) dispatch('choose', page)
    else {
      store.preview(page)
      store.toggle(page)
    }
  }
</script>

<li
  {id}
  role="treeitem"
  class:isPreview
  aria-expanded={!!page.open}
  aria-selected={isPreview}
  aria-level={level}
  aria-setsize={setsize}
  aria-posinset={posinset}
  aria-busy={page.loading}
  tabindex={haveFocus ? 0 : -1}
  on:keydown={onKeyDown}
  on:click={onClick}
>
  <Icon icon={page.open ? fileOutline : (page.loading ? fileSyncOutline : fileOutline)} inline /> {page.name}
</li>
{#if open}
  <ul role="group" class="dialog-asset-sublist">
    {#each page.children as child, i (child.id)}
      {@const setsize = page.children.length}
      {@const posinset = i + 1}
      {@const subprev = i === 0 ? page : page.children[i - 1]}
      {@const subnext = i === setsize - 1 ? next : page.children[i + 1]}
      <svelte:self page={child} {setsize} {posinset} level={nextlevel} prev={subprev} next={subnext} parent={page} on:choose />
    {/each}
  </ul>
{/if}

<style>
  .dialog-asset-sublist {
    list-style: none;
    padding-left: 1em;
  }
  li {
    cursor: pointer;
  }
</style>
