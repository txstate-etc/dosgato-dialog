<script lang="ts" generics="F extends object">
  import databaseIcon from '@iconify-icons/ph/database'
  import folderIcon from '@iconify-icons/ph/folder'
  import folderNotchOpen from '@iconify-icons/ph/folder-notch-open'
  import { createEventDispatcher, getContext, onMount, setContext, tick } from 'svelte'
  import { htmlEncode, isNotBlank, randomid } from 'txstate-utils'
  import { Button, Dialog, Icon, Tabs, Tree, type TabStore, expandTreePath } from '$lib'
  import { DATA_CHOOSER_API_CONTEXT, type DataChooserClient, type DataChooserItem } from './DataChooserAPI'
  import { DATA_CHOOSER_STORE_CONTEXT, DataChooserStore, type DataUIItem } from './DataChooserStore'
  import DataDetails from './DataDetails.svelte'

  const chooserClient = getContext<DataChooserClient>(DATA_CHOOSER_API_CONTEXT)

  export let label: string | undefined = undefined
  /** the templateKey containing the folders and items being chosen from; data items are always organized beneath a templateKey */
  export let rootTemplateKey: string
  export let required = false
  export let initialSource: string | undefined = undefined
  export let initialPath: string | undefined = undefined
  export let activeSources: string[] | undefined = undefined
  export let passthruFilters: F | undefined = undefined
  export let filter: undefined | ((item: DataChooserItem) => boolean | Promise<boolean>) = undefined
  /** hide items whose `published` status is 'unpublished' */
  export let publishedOnly = false
  export let store = new DataChooserStore<F>(chooserClient)

  setContext(DATA_CHOOSER_STORE_CONTEXT, store)
  const dispatch = createEventDispatcher()

  let tabStore: TabStore
  const { sources, source, preview, treeStore } = store
  const selected = store.selected
  $: currentName = tabStore?.currentName()

  $: if ($currentName) {
    store.setSource($currentName)
    treeStore.refresh().catch(console.error)
  }
  $: store.setPreview($selected)

  function onChoose () {
    dispatch('change', { preview: $store.preview })
  }

  function onDeselect () {
    store.setPreview(undefined)
  }

  async function selectPreview (preloadPath: string | undefined) {
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
    await store.init({ rootTemplateKey, activeSources, initialSource: preloadSource, passthruFilters, filter, publishedOnly })
    await treeStore.refresh()
    await selectPreview(preloadPath)
  })

  const previewId = randomid()

  function iconForItem (item: DataUIItem) {
    if (item.icon) return item.icon
    if (item.hasChildren) return { icon: item.open ? folderNotchOpen : folderIcon }
    return { icon: databaseIcon }
  }
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
          { label: 'Path', id: 'name', grow: 4, icon: item => iconForItem(item), render: item => htmlEncode(item.label ?? item.name) }
        ]} singleSelect store={treeStore} on:deselect={onDeselect} on:choose={onChoose} searchable={itm => [itm.label ?? itm.name]} />
      {/if}
    </section>
    <section id={previewId} class="dialog-chooser-preview" tabindex="-1">
      {#if $preview}
        <div class="preview-container">
          <div class="preview-icon">
            <Icon icon={$preview.icon?.icon ?? databaseIcon} width="5em" />
          </div>
          <DataDetails item={$preview} />
        </div>
      {:else}
        <section class="placeholder">
          <p>Select an item to preview it here.</p>
        </section>
      {/if}
    </section>
  </section>
  <svelte:fragment slot="footer-right" let:describedby>
    <Button cancel {describedby} on:click={() => dispatch('escape')}>Cancel</Button>
    <Button class="primary" disabled={!$preview && required} describedby={previewId} on:click={onChoose}>Choose</Button>
  </svelte:fragment>
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
    height: 100%;
    background-color: white;
    overflow: auto;
  }
  .dialog-chooser-controls {
    position: relative;
    width: 100%;
    margin-bottom: 0.5em;
  }
  .dialog-chooser-preview {
    width: 25%;
    max-width: 21em;
    height: 100%;
    padding: 0 1em 1em 1em;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .preview-container {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  .preview-icon {
    display: flex;
    justify-content: center;
    padding: 1em 0;
  }
  .placeholder {
    position: relative;
    background-color: #d8d8d8;
    aspect-ratio: 2 / 1;
  }
  .placeholder p {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    font-weight: 600;
    width: 90%;
    margin: 0;
    display: flex;
    justify-content: center;
    text-align: center;
  }
  @media (max-width: 800px) {
    .dialog-chooser-window {
      flex-direction: column;
      justify-content: space-between;
    }
    .dialog-chooser-chooser {
      flex: 1;
    }
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
    .dialog-chooser-preview {
      order: 1;
      width: 100%;
      max-width: unset;
      padding: 0;
      height: unset;
      display: flex;
      overflow: hidden;
      margin-bottom: 1em;
    }
    .preview-container {
      flex-direction: row;
      align-items: center;
      gap: 1em;
    }
    .placeholder {
      width: 100%;
      aspect-ratio: unset;
      padding: 1em 0;
    }
    .placeholder p {
      position: static;
      transform: none;
      width: 100%;
    }
  }
</style>
