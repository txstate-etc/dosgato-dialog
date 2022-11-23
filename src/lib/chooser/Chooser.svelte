<script lang="ts">
  import applicationOutline from '@iconify-icons/mdi/application-outline'
  import folderLight from '@iconify-icons/ph/folder-light'
  import folderNotchOpenLight from '@iconify-icons/ph/folder-notch-open-light'
  import { derivedStore } from '@txstate-mws/svelte-store'
  import { createEventDispatcher, getContext, onMount, setContext } from 'svelte'
  import { isNotBlank } from 'txstate-utils'
  import { Dialog, iconForMime, Tabs, Tree, TreeStore, type TypedTreeItem } from '$lib'
  import { CHOOSER_API_CONTEXT, type AnyItem, type Client, type Folder, type Page, type Asset } from './ChooserAPI'
  import { CHOOSER_STORE_CONTEXT, ChooserStore } from './ChooserStore'
  import Details from './Details.svelte'
  import Thumbnail from './Thumbnail.svelte'
  import type { TabStore } from '$lib/TabStore'

  const chooserClient = getContext<Client>(CHOOSER_API_CONTEXT)

  type F = $$Generic

  export let label: string|undefined = undefined
  export let images = false
  export let pages = false
  export let assets = images
  export let folders = false
  export let required = false
  export let initialSource: string|undefined = undefined
  export let initialPath: string|undefined = undefined
  export let activeSources: string[]|undefined = undefined
  export let passthruFilters: F|undefined = undefined
  export let filter: undefined|((item: AnyItem) => boolean|Promise<boolean>) = undefined
  export let store = new ChooserStore<F>(chooserClient)

  setContext(CHOOSER_STORE_CONTEXT, store)

  const dispatch = createEventDispatcher()

  let tabStore: TabStore
  const { sources, source, preview } = store
  $: currentName = tabStore?.currentName()

  async function fetchChildren (item?: TypedTreeItem<Page | Folder | Asset>): Promise<AnyItem[]> {
    if (item?.type === 'asset' || !$source) return []
    const children = await chooserClient.getChildren($source.name, item?.path ?? '/', filter)
    return children.map(c => ({ ...c, children: undefined }))
  }

  const treeStore = new TreeStore<Page | Folder | Asset>(fetchChildren)
  const selected = derivedStore<TypedTreeItem<Page | Folder | Asset> | undefined>(treeStore, 'selectedItems.0')
  $: store.setSource($currentName)
  $: selectPreview($preview, $source)
  $: if (['asset', 'page'].includes($selected?.type)) store.setPreview($selected)

  function onChoose () {
    dispatch('change', $store.preview)
  }

  function onDeselect () {
    store.setPreview(undefined)
  }

  async function openRecursive (pathSplit: string[], depth: number): Promise<TypedTreeItem<Page | Asset | Folder>> {
    console.log($treeStore.rootItems)
    let curr = $treeStore.rootItems?.find(itm => itm.name === pathSplit[0])
    for (let i = 0; i < depth; i++) {
      curr = curr?.children?.find(c => c.name === pathSplit[i + 1])
    }
    if (!curr) return
    await treeStore.open(curr, false)
    if (depth + 1 >= pathSplit.length) return curr
    return await openRecursive(pathSplit, depth + 1)
  }
  async function selectPreview (..._: any) {
    if (!$store.initialized) return
    await treeStore.refresh(undefined)
    const preloadSource = $preview?.source ?? initialSource
    if ($source?.name !== preloadSource) return
    const preloadPath = $store.preview?.path ?? initialPath
    initialSource = undefined
    initialPath = undefined
    if (preloadPath) {
      const currentSelection = await openRecursive(preloadPath.split('/').filter(isNotBlank), 0)
      treeStore.trigger()
      if (!currentSelection) return
      store.setPreview(currentSelection)
      treeStore.select(currentSelection, {})
      treeStore.trigger()
    }
  }
  onMount(async () => {
    await store.init({ images, pages, assets, folders, activeSources, initialSource, initialPath, passthruFilters, filter })
    tabStore.activateName($source.name)
    await selectPreview()
  })
</script>

<Dialog size="xl" ignoreTabs title={label} on:escape continueText="Choose" disabled={!$store.preview && required} cancelText="Cancel" on:continue={onChoose}>
  <section class="dialog-chooser-window">
    <header class="dialog-chooser-controls">
      {#if $sources.length > 1}
        <Tabs bind:store={tabStore} tabs={$sources.map(s => ({ id: s.name, title: s.label ?? s.name }))} />
      {/if}
    </header>
    <section class="dialog-chooser-chooser">
      {#if $store.initialized}
        <Tree headers={[
          { label: 'Path', id: 'name', grow: 4, icon: item => item.type === 'asset' ? iconForMime(item.mime) : (item.type === 'folder' ? (item.open ? folderNotchOpenLight : folderLight) : applicationOutline), get: 'name' }
        ]} singleSelect store={treeStore} on:deselect={onDeselect} on:choose={onChoose} />
      {/if}
    </section>
    <section class="dialog-chooser-preview" tabindex="-1">
      {#if $preview}
        <Thumbnail item={$preview} />
        <Details item={$preview}>
          {#if $preview.type === 'folder'}
            <li>{$selected.children?.length || 0} sub-items</li>
          {/if}
        </Details>
      {/if}
    </section>
  </section>
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
    padding: 0.5em;
    overflow: auto;
  }
  .dialog-chooser-preview {
    width: 25%;
    max-width: 21em;
    height: calc(100% - 4em);
    padding: 1em;
    overflow-y: auto;
  }
  header {
    position: relative;
    width: 100%;
  }
</style>
