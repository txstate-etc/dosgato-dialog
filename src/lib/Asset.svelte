<script lang="ts">
  import { modifierKey } from '@txstate-mws/svelte-components'
  import { getContext } from 'svelte'
  import { hashid } from 'txstate-utils'
  import type { AssetStore, UIFolder, UIAsset } from './AssetStore'
  import { ASSET_STORE_CONTEXT } from './AssetStore'
  import FileIcon from './FileIcon.svelte'
  import type { Asset } from './AssetAPI'

  export let asset: Asset
  export let level: number
  export let posinset: number
  export let setsize: number
  export let next: UIFolder|UIAsset|undefined
  export let prev: UIFolder|UIAsset|undefined
  export let parent: UIFolder|undefined = undefined

  const store = getContext<AssetStore>(ASSET_STORE_CONTEXT)
  $: id = hashid(asset.id)
  $: haveFocus = $store?.focus === asset.id
  $: isPreview = $store.preview?.id === asset.id

  function onKeyDown (e: KeyboardEvent) {
    if (modifierKey(e)) return
    if (['Enter', ' '].includes(e.key)) {
      e.preventDefault()
      e.stopPropagation()
      store.preview(asset)
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

</script>

<li
  {id}
  role="treeitem"
  tabindex={haveFocus ? 0 : -1}
  aria-setsize={setsize}
  aria-posinset={posinset}
  aria-level={level}
  class="dialog-asset-file"
  class:isPreview
  on:keydown={onKeyDown}
  on:click={() => store.preview(asset)}
>
  <FileIcon mime={asset.mime} inline /> {asset.name}
</li>

<style>
  li {
    cursor: pointer;
  }
  .isPreview {
    background-color: var(--asset-chooser-active-bg, #333333);
    color: var(--asset-chooser-active, #FFFFFF);
  }
</style>
