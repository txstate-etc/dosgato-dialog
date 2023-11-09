<script lang="ts">
  import browserIcon from '@iconify-icons/ph/browser'
  import folderIcon from '@iconify-icons/ph/folder'
  import folderNotchOpen from '@iconify-icons/ph/folder-notch-open'
  import { createEventDispatcher, getContext, onMount, setContext, tick } from 'svelte'
  import { isNotBlank, randomid } from 'txstate-utils'
  import { Button, Dialog, iconForMime, Tabs, Tree, type TypedTreeItem, type TabStore, UploadUI } from '$lib'
  import { CHOOSER_API_CONTEXT, type AnyItem, type Client, type Folder, type Page, type Asset } from './ChooserAPI'
  import { CHOOSER_STORE_CONTEXT, ChooserStore } from './ChooserStore'
  import Details from './Details.svelte'
  import Thumbnail from './Thumbnail.svelte'
  import ChooserPreview from './ChooserPreview.svelte'

  const chooserClient = getContext<Client>(CHOOSER_API_CONTEXT)

  type F = $$Generic

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
    dispatch('change', $store.preview)
  }

  function onDeselect () {
    store.setPreview(undefined)
    thumbnailExpanded = false
  }

  function onUploadComplete () {
    treeStore.openAndRefresh($selected!).catch(console.error)
    showuploader = false
  }

  async function openRecursive (pathSplit: string[], depth: number): Promise<TypedTreeItem<Page | Asset | Folder> | undefined> {
    let curr = $treeStore.rootItems?.find(itm => itm.name === pathSplit[0])
    for (let i = 0; i < depth; i++) {
      curr = curr?.children?.find(c => c.name === pathSplit[i + 1])
    }
    if (!curr) {
      console.warn('tried to preload a path', '/' + pathSplit.join('/'), 'that does not exist ')
      return
    }
    await treeStore.open(curr, false)
    if (depth + 1 >= pathSplit.length) return curr
    return await openRecursive(pathSplit, depth + 1)
  }
  async function selectPreview (preloadPath) {
    if (!$store.initialized) return
    if (preloadPath) {
      const currentSelection = await openRecursive(preloadPath.split('/').filter(isNotBlank), 0)
      treeStore.trigger()
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
</script>

<Dialog size="xl" ignoreTabs title={label} on:escape continueText="Choose" disabled={!$preview && required} cancelText="Cancel">
  <section class="dialog-chooser-window">
    {#if $sources.length > 1}
    <header class="dialog-chooser-controls">
      <Tabs bind:store={tabStore} tabs={$sources.map(s => ({ name: s.name, title: s.label ?? s.name }))} active={$preview?.source ?? $selected?.source ?? $source?.name ?? initialSource} accordionOnMobile={false}/>
    </header>
    {/if}
    <section class="dialog-chooser-chooser">
      {#if $store.initialized}
        <Tree headers={[
          { label: 'Path', id: 'name', grow: 4, icon: item => ({ icon: item.type === 'asset' ? iconForMime(item.mime) : (item.type === 'folder' ? (item.open ? folderNotchOpen : folderIcon) : browserIcon) }), get: 'name' }
        ]} singleSelect store={treeStore} on:deselect={onDeselect} on:choose={onChoose} />
      {/if}
    </section>
    <ChooserPreview {thumbnailExpanded} {previewId} {store} on:thumbnailsizechange={() => { thumbnailExpanded = !thumbnailExpanded }}/>
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
    height: 80vh;
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    justify-content: flex-end;
    overflow: hidden;
    container-type: inline-size;
    container-name: dosgato-dialog-chooser-window
  }
  .dialog-chooser-window * {
    box-sizing: border-box;
  }
  .dialog-chooser-chooser {
    position: relative;
    width: 75%;
    min-width: calc(100% - 21em);
    height: calc(100% - 4em);
    background-color: white;
    overflow: auto;
  }
  .dialog-chooser-controls {
    position: relative;
    width: 100%;
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
      height: 70%;
    }
  }
</style>
