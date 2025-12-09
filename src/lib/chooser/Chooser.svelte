<script lang="ts" generics="F">
  import browserIcon from '@iconify-icons/ph/browser'
  import folderIcon from '@iconify-icons/ph/folder'
  import folderNotchOpen from '@iconify-icons/ph/folder-notch-open'
  import { createEventDispatcher, getContext, onMount, setContext, tick } from 'svelte'
  import { isNotBlank, randomid } from 'txstate-utils'
  import { Button, Dialog, iconForMime, Tabs, Tree, type TypedTreeItem, type TabStore, UploadUI, expandTreePath } from '$lib'
  import { CHOOSER_API_CONTEXT, type AnyItem, type Client } from './ChooserAPI'
  import { CHOOSER_STORE_CONTEXT, ChooserStore } from './ChooserStore'
  import ChooserPreview from './ChooserPreview.svelte'

  const chooserClient = getContext<Client>(CHOOSER_API_CONTEXT)

  export let label: string | undefined = undefined
  export let images = false
  export let pages = false
  export let assets = images
  export let folders = false
  export let required = false
  export let initialSource: string | undefined = undefined
  export let initialPath: string | undefined = undefined
  export let activeSources: string[] | undefined = undefined
  export let passthruFilters: F | undefined = undefined
  export let filter: undefined | ((item: AnyItem) => boolean | Promise<boolean>) = undefined
  export let store = new ChooserStore<F>(chooserClient)
  export let showAltTextOption = false
  store.filter = filter

  setContext(CHOOSER_STORE_CONTEXT, store)
  const dispatch = createEventDispatcher()

  let showuploader = false
  let tabStore: TabStore
  const { sources, source, preview, treeStore, selected } = store
  $: currentName = tabStore?.currentName()

  $: if ($currentName) {
    store.setSource($currentName)
    treeStore.refresh().catch(console.error)
  }
  $: store.setPreview($selected)

  function onChoose () {
    dispatch('change', { preview: $store.preview, copyAltText: altTextCheckbox?.checked ?? false } )
  }

  function onDeselect () {
    store.setPreview(undefined)
    thumbnailExpanded = false
  }

  function onUploadComplete () {
    treeStore.openAndRefresh($selected!).catch(console.error)
    showuploader = false
  }

  async function selectPreview (preloadPath) {
    if (!$store.initialized) return
    if (preloadPath) {
      const currentSelection = await expandTreePath(treeStore, preloadPath.split('/').filter(isNotBlank))
      if (!currentSelection) return
      store.setPreview(currentSelection)
      treeStore.select(currentSelection, { clear: true })
      await tick()
      const focusedElement = document.querySelector('.tree-node[tabindex="0"]')
      if (focusedElement?.classList.contains('tree-node')) focusedElement.scrollIntoView({ block: 'center' })
    }
  }
  onMount(async () => {
    const preloadSource = $preview?.source ?? $selected?.source ?? $source?.name ?? initialSource
    const preloadPath = $preview?.path ?? $selected?.path ?? initialPath
    await store.init({ images, pages, assets, folders, activeSources, initialSource: preloadSource, initialPath: preloadPath, passthruFilters, filter })
    await treeStore.refresh()
    await selectPreview(preloadPath)
  })

  const previewId = randomid()
  let thumbnailExpanded = false

  function iconForItem (item: TypedTreeItem<AnyItem>) {
    if (item.icon) {
      return item.icon
    } else {
      return {
        icon: item.type === 'asset' ? iconForMime(item.mime) : (item.type === 'folder' ? (item.open ? folderNotchOpen : folderIcon) : browserIcon)
      }
    }
  }

  let altTextCheckbox: HTMLInputElement
</script>

<Dialog size="xl" ignoreTabs title={label} on:escape continueText="Choose" disabled={!$preview && required} cancelText="Cancel">
  <section class="dialog-chooser-window" class:no-controls={$sources.length < 2}>
    {#if $sources.length > 1}
    <header class="dialog-chooser-controls">
      <Tabs bind:store={tabStore} tabs={$sources.map(s => ({ name: s.name, title: s.label ?? s.name }))} active={$preview?.source ?? $selected?.source ?? $source?.name ?? initialSource} accordionOnMobile={false}/>
    </header>
    {/if}
    <section class="dialog-chooser-chooser">
      {#if $store.initialized}
        <Tree headers={[
          { label: 'Path', id: 'name', grow: 4, icon: item => iconForItem(item), get: 'name' }
        ]} singleSelect store={treeStore} on:deselect={onDeselect} on:choose={onChoose} searchable='name' />
      {/if}
    </section>
    <ChooserPreview {thumbnailExpanded} {previewId} {store} on:thumbnailsizechange={() => { thumbnailExpanded = !thumbnailExpanded }}/>
    {#if showAltTextOption && $preview && $preview.type === 'asset' && $preview.image}
      <section class="alt-text-options">
        <label>
          <input bind:this={altTextCheckbox} type="checkbox" />
          <span>Copy/paste alt. text (if available)</span>
        </label>
      </section>
    {/if}
  </section>
  <svelte:fragment slot="buttons" let:describedby>
    {#if chooserClient.upload && $source?.type === 'asset'}
      <Button class="upload" disabled={$selected?.type !== 'folder' || !(chooserClient.mayUpload?.($selected) ?? true)} on:click={() => { showuploader = true }}>Upload</Button>
    {/if}
    <Button cancel {describedby} on:click={() => dispatch('escape')}>Cancel</Button>
    <Button class="primary" disabled={!$preview && required} describedby={previewId} on:click={onChoose}>Choose</Button>
  </svelte:fragment>
  {#if showuploader && $selected?.type === 'folder' && chooserClient.upload}
    <UploadUI title="Upload to {$selected.path}" folder={$selected} uploader={chooserClient.upload.bind(chooserClient)} on:escape={() => { showuploader = false }} on:saved={onUploadComplete}/>
  {/if}
</Dialog>

<style>
  .dialog-chooser-window {
    position: relative;
    height: 75vh;
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    justify-content: flex-end;
    overflow: hidden;
    container-type: inline-size;
    container-name: dosgato-dialog-chooser-window
  }
  .dialog-chooser-window.no-controls {
    height: 80vh;
  }
  .dialog-chooser-window * {
    box-sizing: border-box;
  }
  .dialog-chooser-chooser {
    position: relative;
    width: 75%;
    min-width: calc(100% - 21em);
    height: calc(100% - 4.5em);
    background-color: white;
    overflow: auto;
  }
  .dialog-chooser-controls {
    position: relative;
    width: 100%;
  }
  .alt-text-options {
    width: 100%;
    padding-block: 1em;
  }
  :global(footer.actions .upload) {
    margin-right: auto;
  }
  @container dosgato-dialog-chooser-window (max-width: 800px) {
    .dialog-chooser-controls {
      order: 2;
    }
    .dialog-chooser-chooser {
      order: 3;
      width: 100%;
      height: 50%;
    }
    .alt-text-options {
      order: 4;
    }
  }
</style>
