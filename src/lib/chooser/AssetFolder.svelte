<script lang="ts">
  import folderOutline from '@iconify-icons/mdi/folder-outline.js'
  import folderOpenOutline from '@iconify-icons/mdi/folder-open-outline.js'
  import folderSyncOutline from '@iconify-icons/mdi/folder-sync-outline.js'
  import { modifierKey } from '@txstate-mws/svelte-components'
  import { createEventDispatcher, getContext } from 'svelte'
  import { hashid } from 'txstate-utils'
  import type { ChooserStore, UIFolder, AnyUIItem } from './ChooserStore'
  import { CHOOSER_STORE_CONTEXT } from './ChooserStore'
  import Asset from './Asset.svelte'
  import Icon from '../Icon.svelte'

  export let folder: UIFolder
  export let level: number
  export let posinset: number
  export let setsize: number
  export let next: AnyUIItem|undefined
  export let prev: AnyUIItem|undefined
  export let parent: UIFolder|undefined = undefined

  const store = getContext<ChooserStore>(CHOOSER_STORE_CONTEXT)
  $: open = folder.open && folder.children?.length
  $: nextlevel = level + 1
  $: id = hashid(folder.id)
  $: haveFocus = $store.focus === folder.id
  $: isPreview = $store.preview?.id === folder.id

  const dispatch = createEventDispatcher()

  function onKeyDown (e: KeyboardEvent) {
    if (modifierKey(e)) return
    if (['Enter', ' '].includes(e.key)) {
      onClick(e)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      e.stopPropagation()
      if (folder.open && folder.children?.length) {
        const child = folder.children[0]
        store.setFocus(child)
        document.getElementById(hashid(child.id)).focus()
      } else {
        store.open(folder)
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      e.stopPropagation()
      if (folder.open) {
        store.close(folder)
      } else if (parent) {
        store.setFocus(parent)
        document.getElementById(hashid(parent.id)).focus()
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      e.stopPropagation()
      const mynext = open ? folder.children[0] : next
      if (mynext) {
        store.setFocus(mynext)
        document.getElementById(hashid(mynext.id)).focus()
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      e.stopPropagation()
      const anyprev = prev as any
      const myprev = anyprev?.open && anyprev.children?.length && anyprev.path === folder.path ? anyprev.children[anyprev.children.length - 1] : prev
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
    if ($store.preview?.id === folder.id) dispatch('choose', folder)
    else {
      store.preview(folder)
      store.toggle(folder)
    }
  }
</script>

<li
  {id}
  role="treeitem"
  class:isPreview
  aria-expanded={!!folder.open}
  aria-selected={isPreview}
  aria-level={level}
  aria-setsize={setsize}
  aria-posinset={posinset}
  aria-busy={folder.loading}
  tabindex={haveFocus ? 0 : -1}
  on:keydown={onKeyDown}
  on:click={onClick}
>
  <Icon icon={folder.open ? folderOpenOutline : (folder.loading ? folderSyncOutline : folderOutline)} inline /> {folder.name}
</li>
{#if open}
  <ul role="group" class="dialog-asset-sublist">
    {#each folder.children as child, i (child.id)}
      {@const setsize = folder.children.length}
      {@const posinset = i + 1}
      {@const subprev = i === 0 ? folder : folder.children[i - 1]}
      {@const subnext = i === setsize - 1 ? next : folder.children[i + 1]}
      {#if child.type === 'folder'}
        <svelte:self folder={child} {setsize} {posinset} level={nextlevel} prev={subprev} next={subnext} parent={folder} on:choose />
      {:else}
        <Asset asset={child} {setsize} {posinset} level={nextlevel} prev={subprev} next={subnext} parent={folder} on:choose />
      {/if}
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
