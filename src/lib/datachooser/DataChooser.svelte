<script lang="ts" generics="F extends object">
  import databaseIcon from '@iconify-icons/ph/database'
  import folderIcon from '@iconify-icons/ph/folder'
  import folderNotchOpen from '@iconify-icons/ph/folder-notch-open'
  import { createEventDispatcher, getContext, onMount, setContext, tick } from 'svelte'
  import { htmlEncode, isNotBlank, randomid } from 'txstate-utils'
  import { Button, Dialog, Icon, Tabs, Tree, type TabStore, expandTreePath, publishedStatusColors, publishedStatusTreeIcon } from '$lib'
  import { DATA_CHOOSER_API_CONTEXT, describeSelections, type DataChooserClient, type DataChooserItem } from './DataChooserAPI'
  import { DATA_CHOOSER_STORE_CONTEXT, DataChooserStore, type DataUIItem } from './DataChooserStore'
  import { NestedData } from '@txstate-mws/svelte-components'
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
  /** return true to disable selection of an item without hiding it like `filter` does */
  export let disable: undefined | ((item: DataChooserItem) => boolean) = undefined
  /** hide items whose `published` status is 'unpublished' */
  export let publishedOnly = false
  /** render tag-bearing strings in the preview data as real (scrubbed) HTML; only for trusted payloads */
  export let previewAllowHtml = false
  /** app-level display overrides for the preview data; consulted before the built-in encodePreviewLink/encodePreviewImage handling */
  export let previewFormat: undefined | ((value: string, path: (string | number)[]) => string | { html: string, inline?: boolean } | undefined) = undefined
  /** allow multiple selections; the change event carries them in `selections` */
  export let multiple = false
  /** allow items marked `folder` to be chosen as values */
  export let selectableFolders = false
  /** selections to check when the chooser opens, e.g. the field's current value */
  export let preloadSelections: DataChooserItem[] = []
  export let store = new DataChooserStore<F>(chooserClient)

  setContext(DATA_CHOOSER_STORE_CONTEXT, store)
  const dispatch = createEventDispatcher()

  let tabStore: TabStore
  const { sources, source, preview, previewData, treeStore, chosen } = store
  const selected = store.selected
  $: currentName = tabStore?.currentName()

  $: if ($currentName) void switchSource($currentName)

  async function switchSource (name: string) {
    const prev = $source
    if (!$store.initialized || !prev || name === prev.name) return
    // remember the active source's selections so they survive the tab switch
    if (multiple) store.stashSelections(prev.name, $chosen.filter(itm => itm.source === prev.name))
    store.setSource(name)
    await treeStore.refresh()
    if (multiple) await selectItems(store.takeStash(name))
  }
  $: store.setPreview(multiple ? $chosen[$chosen.length - 1] : $selected)

  function onChoose () {
    dispatch('change', { preview: $store.preview, selections: multiple ? $chosen : ($store.preview ? [$store.preview] : []) })
  }

  function onDeselect () {
    if (!multiple) store.setPreview(undefined)
  }

  async function scrollToFocused () {
    await tick()
    const focusedElement = document.querySelector('.tree-node[tabindex="0"]')
    if (focusedElement?.classList.contains('tree-node')) focusedElement.scrollIntoView({ block: 'center' })
  }

  async function selectPreview (preloadPath: string | undefined) {
    if (!$store.initialized) return
    if (preloadPath) {
      const currentSelection = await expandTreePath(treeStore, preloadPath.split('/').filter(isNotBlank))
      if (!currentSelection) return
      store.setPreview(currentSelection)
      treeStore.select(currentSelection, { clear: true })
      await scrollToFocused()
    }
  }

  async function selectItems (items: DataChooserItem[]) {
    const toSelect: DataUIItem[] = []
    // an item that is no longer choosable (e.g. rejected by the disable prop) must
    // not sneak back into the selection through a preload or a source switch
    for (const itm of items.filter(i => store.isChoosable(i))) {
      // expand down to the item so its checkbox is visible and checked; items that
      // cannot be shown (e.g. hidden by the current filters) fall out of the selection
      // eslint-disable-next-line no-await-in-loop -- expansions share the tree store and must run one at a time
      const treeItem = await expandTreePath(treeStore, itm.path.split('/').filter(isNotBlank))
      if (treeItem) toSelect.push(treeItem)
    }
    // always sync, even to empty - the tree store outlives the dialog and may hold
    // selections from a previous open that the user cancelled
    treeStore.setSelected(toSelect, {})
    if (toSelect.length) await scrollToFocused()
  }

  async function selectPreloaded () {
    if (!$store.initialized) return
    const active: DataChooserItem[] = []
    const other: Record<string, DataChooserItem[]> = {}
    for (const itm of preloadSelections) {
      if (itm.source === $source?.name) active.push(itm)
      else (other[itm.source] ??= []).push(itm)
    }
    for (const [sourceName, items] of Object.entries(other)) store.stashSelections(sourceName, items)
    await selectItems(active)
  }

  onMount(async () => {
    const preloadSource = (multiple ? preloadSelections[0]?.source : ($preview?.source ?? $selected?.source)) ?? $source?.name ?? initialSource
    const preloadPath = $preview?.path ?? $selected?.path ?? initialPath
    await store.init({ rootTemplateKey, activeSources, initialSource: preloadSource, passthruFilters, filter, disable, publishedOnly, multiple, selectableFolders })
    await treeStore.refresh()
    if (multiple) await selectPreloaded()
    else await selectPreview(preloadPath)
  })

  const previewId = randomid()

  /**
   * the app's previewFormat gets first refusal, then we catch any remaining
   * encodePreviewLink / encodePreviewImage strings the client embedded in the
   * payload; the markup we build here is trusted by NestedData, but the hrefs
   * come from the client's data, so NestedData still scrubs executable schemes
   */
  function previewFormatter (value: string, path: (string | number)[]) {
    const result = previewFormat?.(value, path)
    if (result != null) return result
    if (!value.startsWith('{')) return undefined
    let parsed: any
    try { parsed = JSON.parse(value) } catch { return undefined }
    if (typeof parsed?.link === 'string') {
      return { html: `<a href="${htmlEncode(parsed.link)}" target="_blank" rel="noopener">${htmlEncode(parsed.label ?? parsed.link)}</a>`, inline: true }
    }
    if (typeof parsed?.image === 'string') {
      return { html: `<img src="${htmlEncode(parsed.image)}" alt="${htmlEncode(parsed.alt ?? '')}">` }
    }
    return undefined
  }

  function iconForItem (item: DataUIItem) {
    if (item.icon) return item.icon
    if (item.hasChildren) return { icon: item.open ? folderNotchOpen : folderIcon }
    return { icon: databaseIcon }
  }
</script>

<Dialog size="xl" ignoreTabs title={label} on:escape continueText="Choose" disabled={required && (multiple ? !$chosen.length : !$preview)} cancelText="Cancel">
  <section class="dialog-chooser-window" class:no-controls={$sources.length < 2}>
    {#if $sources.length > 1}
    <header class="dialog-chooser-controls">
      <Tabs bind:store={tabStore} tabs={$sources.map(s => ({ name: s.name, title: s.label ?? s.name }))} active={$preview?.source ?? $selected?.source ?? $source?.name ?? initialSource} accordionOnMobile={false}/>
    </header>
    {/if}
    <section class="dialog-chooser-chooser"
      style:--dg-status-published={publishedStatusColors.published}
      style:--dg-status-modified={publishedStatusColors.modified}
      style:--dg-status-unpublished={publishedStatusColors.unpublished}
    >
      {#if $store.initialized}
        <Tree headers={[
          { label: 'Path', id: 'name', grow: 4, icon: item => iconForItem(item), render: item => htmlEncode(item.label ?? item.name) },
          { label: 'Status', id: 'status', fixed: '4.5em', icon: item => item.published ? publishedStatusTreeIcon(item.published) : undefined }
        ]} singleSelect={!multiple} selectEligible={itm => store.isChoosable(itm)} store={treeStore} on:deselect={onDeselect} on:choose={onChoose} searchable={itm => [itm.label ?? itm.name]} />
      {/if}
    </section>
    <section id={previewId} class="dialog-chooser-preview" tabindex="-1">
      {#if multiple && $chosen.length}
        <div class="selection-count">{describeSelections($chosen)} selected</div>
      {/if}
      {#if $preview}
        <div class="preview-container">
          <div class="preview-icon">
            <Icon icon={$preview.icon?.icon ?? databaseIcon} width="2.5em" />
          </div>
          <DataDetails item={$preview} />
          {#if $previewData != null}
            <div class="preview-data">
              <NestedData data={$previewData} allowHtml={previewAllowHtml} format={previewFormatter} />
            </div>
          {/if}
        </div>
      {:else}
        <section class="placeholder">
          <p>Select {#if multiple}items to add them to your selections.{:else}an item to preview it here.{/if}</p>
        </section>
      {/if}
    </section>
  </section>
  <svelte:fragment slot="footer-right" let:describedby>
    <Button cancel {describedby} on:click={() => dispatch('escape')}>Cancel</Button>
    <Button class="primary" disabled={required && (multiple ? !$chosen.length : !$preview)} describedby={previewId} on:click={onChoose}>Choose</Button>
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
  .dialog-chooser-window :global(*) {
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
  .dialog-chooser-chooser :global(.tree-cell.status) {
    display: flex;
    justify-content: center;
  }
  .dialog-chooser-chooser :global(.tree-cell.status .icon.published) {
    color: var(--dg-status-published);
  }
  .dialog-chooser-chooser :global(.tree-cell.status .icon.modified) {
    color: var(--dg-status-modified);
  }
  .dialog-chooser-chooser :global(.tree-cell.status .icon.unpublished) {
    color: var(--dg-status-unpublished);
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
  .selection-count {
    font-weight: 600;
    padding: 0.7em 0 0 0;
  }
  .preview-container {
    width: 100%;
    padding-top: 0.7em;
  }
  /* the icon floats top right and the name/path details rise up alongside it */
  .preview-icon {
    float: right;
    margin: 0 0 0.4em 0.6em;
  }
  .preview-data {
    margin-top: 0.7em;
    padding-top: 0.7em;
    border-top: 1px solid #cccccc;
    font-size: 0.9em;
    overflow-wrap: anywhere;
  }
  /* PreviewImage thumbnails: a block that fills whatever width the indenting left, up to 200px */
  .preview-data :global(.nested-data-trusted img) {
    display: block;
    width: 100%;
    max-width: 200px;
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
