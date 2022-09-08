<script lang="ts">
  import { modifierKey } from '@txstate-mws/svelte-components'
  import { createEventDispatcher, getContext } from 'svelte'
  import { hashid } from 'txstate-utils'
  import type { ChooserStore, UIAsset, UIFolder, AnyUIItem } from './ChooserStore'
  import { CHOOSER_STORE_CONTEXT } from './ChooserStore'
  import FileIcon from '../FileIcon.svelte'

  export let asset: UIAsset
  export let level: number
  export let posinset: number
  export let setsize: number
  export let next: AnyUIItem|undefined
  export let prev: AnyUIItem|undefined
  export let parent: UIFolder|undefined = undefined

  const store = getContext<ChooserStore>(CHOOSER_STORE_CONTEXT)
  $: id = hashid(asset.id)
  $: haveFocus = $store?.focus === asset.id
  $: isPreview = $store.preview?.id === asset.id

  const dispatch = createEventDispatcher()

  function onKeyDown (e: KeyboardEvent) {
    if (modifierKey(e)) return
    if (['Enter', ' '].includes(e.key)) {
      onClick(e)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      e.stopPropagation()
      if (next) {
        store.setFocus(next)
        document.getElementById(hashid(next.id)).focus()
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      e.stopPropagation()
      const anyprev = prev as any
      const myprev = anyprev?.open && anyprev.children?.length && anyprev.path === asset.path ? anyprev.children[anyprev.children.length - 1] : prev
      if (myprev) {
        store.setFocus(myprev)
        document.getElementById(hashid(myprev.id)).focus()
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      e.stopPropagation()
      if (parent) {
        store.setFocus(parent)
        document.getElementById(hashid(parent.id)).focus()
      }
    }
  }

  function onClick (e) {
    e.preventDefault()
    e.stopPropagation()
    // if the id was already the same as the one that was clicked, the user
    // has clicked it twice, so we should choose the item and end the modal
    if ($store.preview?.id === asset.id) dispatch('choose', asset)
    else store.preview(asset)
  }
</script>

<li
  {id}
  role="treeitem"
  tabindex={haveFocus ? 0 : -1}
  aria-setsize={setsize}
  aria-posinset={posinset}
  aria-level={level}
  aria-selected={isPreview}
  class="dialog-asset-file"
  class:isPreview
  on:keydown={onKeyDown}
  on:click={onClick}
>
  <FileIcon mime={asset.mime} inline /> {asset.name}
</li>

<style>
  li {
    cursor: pointer;
  }
</style>
