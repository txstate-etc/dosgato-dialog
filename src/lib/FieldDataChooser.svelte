<script lang="ts">
  import arrowClockwiseFill from '@iconify-icons/ph/arrow-clockwise-fill'
  import databaseIcon from '@iconify-icons/ph/database'
  import deleteOutline from '@iconify-icons/mdi/delete'
  import linkVariantOff from '@iconify-icons/mdi/link-variant-off'
  import pencilOutline from '@iconify-icons/mdi/pencil-outline'
  import { FORM_CONTEXT, FORM_INHERITED_PATH, type FormStore } from '@txstate-mws/svelte-forms'
  import { getContext } from 'svelte'
  import { isNotBlank, isNotNull, randomid } from 'txstate-utils'
  import { DATA_CHOOSER_API_CONTEXT, describeSelections, type DataChooserClient, type DataChooserItem, type UnknownDataItem } from './datachooser/DataChooserAPI'
  import DataChooser from './datachooser/DataChooser.svelte'
  import { DataChooserStore } from './datachooser/DataChooserStore'
  import DataDetails from './datachooser/DataDetails.svelte'
  import { getDescribedBy, FieldStandard, Icon } from '$lib'

  export let id: string | undefined = undefined
  export let path: string
  export let label = ''
  /**
   * The templateKey acting as the container for the folders and items being chosen
   * from. Data items are always organized beneath a templateKey, but sub-items may
   * carry a different templateKey - e.g. a rootTemplateKey of 'book' where each book
   * contains items with a 'chapter' templateKey.
   */
  export let rootTemplateKey: string
  export let defaultValue: string | string[] | undefined = undefined
  export let conditional: boolean | undefined = undefined
  export let required = false
  /**
   * allow multiple selections; the field's value becomes an array of item ids and
   * the UI summarizes the selections instead of detailing a single item
   *
   * a preloaded single-string value is tolerated and converted to an array on the
   * next save, so a field can be upgraded to multiple without migrating stored data
   */
  export let multiple = false
  /**
   * allow items marked `folder` by the client to be chosen. A chosen folder means
   * "everything beneath it, now and in the future" - the implementing application
   * is expected to resolve it to its contents at render time - so any selections
   * beneath a chosen folder are deduplicated away when the user confirms. Only
   * meaningful with `multiple`, though technically allowed without it.
   */
  export let selectableFolders = false
  /**
   * Arbitrarily restrict which items may be chosen, e.g. to specific types of data
   * by templateKey. Return false for a container to hide it and everything beneath
   * it - so a filter targeting templateKey should return true for items without one.
   *
   * While a filter (or publishedOnly) is active, opening a container looks ahead
   * one level, at the cost of extra fetches, so the expand arrows and sub-item
   * counts inside reflect the filtered tree instead of promising children that
   * turn out to be filtered away. Root-level containers keep the client-reported
   * arrow as a performance tradeoff; opening one that comes up empty simply
   * removes the arrow at that point.
   */
  export let filter: undefined | ((item: DataChooserItem) => boolean | Promise<boolean>) = undefined
  /**
   * Return true to disable selection of an item. Unlike `filter`, which hides
   * rejected items and everything beneath them, disabled items stay visible and
   * browsable - they just cannot be selected and their checkboxes render disabled.
   * When both reject an item, filter wins: the item disappears entirely instead of
   * rendering as a disabled row.
   *
   * Only items are passed in, never folders - folder selection is governed solely
   * by the selectableFolders prop. That means a selectable folder can be chosen
   * even when all of its current children are disabled, so render implementations
   * should filter the records they resolve from a folder rather than relying on
   * the chooser to have prevented the selection.
   *
   * Must be synchronous - it runs inside click handling and store derivations.
   */
  export let disable: undefined | ((item: DataChooserItem) => boolean) = undefined
  /**
   * Hide items whose `published` status is 'unpublished'. 'modified' items still
   * have a live published version, so they remain choosable, as do items with no
   * status at all (containers, or clients that do not track publish status).
   *
   * A preloaded value is still displayed even if its item is unpublished; the
   * restriction only applies while choosing.
   */
  export let publishedOnly = false
  /**
   * Passed through to the DataChooserClient on every fetch, in case the
   * implementing application supports extra filtering options.
   */
  export let passthruFilters: any = undefined
  /** Restrict the chooser to a subset of the client's sources for this rootTemplateKey. */
  /**
   * Render tag-bearing strings in the preview data as real (scrubbed) HTML.
   * Only enable when the client's preview payloads are trusted.
   */
  export let previewAllowHtml = false
  /**
   * App-level display overrides for the preview data, consulted before the
   * built-in PreviewLink/PreviewImage handling. See NestedData's format prop
   * in @txstate-mws/svelte-components for the contract.
   */
  export let previewFormat: undefined | ((value: string, path: (string | number)[]) => string | { html: string, inline?: boolean } | undefined) = undefined
  export let activeSources: string[] | undefined = undefined
  export let initialSource: string | undefined = undefined
  export let initialPath: string | undefined = undefined
  export let related: true | number = 0
  export let extradescid: string | undefined = undefined
  export let helptext: string | undefined = undefined
  export let selectedItem: DataChooserItem | UnknownDataItem | undefined = undefined
  /** the resolved selections when `multiple`; unresolvable ids appear as UnknownDataItem */
  export let selectedItems: (DataChooserItem | UnknownDataItem)[] = []

  const formStore = getContext<FormStore>(FORM_CONTEXT)
  const inheritedPath = getContext<string>(FORM_INHERITED_PATH)
  const finalPath = [inheritedPath, path].filter(isNotBlank).join('.')
  const value = formStore.getField<string | string[]>(finalPath)
  const chooserClient = getContext<DataChooserClient>(DATA_CHOOSER_API_CONTEXT)
  const store = new DataChooserStore(chooserClient)

  const descid = randomid()
  let modalshown = false
  function show () {
    if (!multiple && selectedItem && !('broken' in selectedItem)) store.setPreview(selectedItem)
    modalshown = true
  }
  function hide () {
    modalshown = false
  }
  function onChange (setVal: any) {
    return (e: CustomEvent<{ preview: DataChooserItem | undefined, selections: DataChooserItem[] }>) => {
      if (multiple) {
        // what the user confirmed in the chooser becomes the whole value; that
        // drops unknown items, which cannot be shown in the chooser - cancelling
        // is the way to keep them
        selectedItems = e.detail.selections
        setVal(selectedItems.length ? selectedItems.map(itm => itm.id) : undefined)
      } else {
        selectedItem = e.detail.preview
        setVal(selectedItem?.id)
      }
      hide()
    }
  }

  function removeAll (setVal: any) {
    return () => {
      selectedItems = []
      setVal(undefined)
    }
  }

  function valueAsArray ($value: string | string[] | undefined) {
    // tolerate a single-string value so a field may be upgraded to multiple
    // without migrating stored data
    if (Array.isArray($value)) return $value
    return typeof $value === 'string' && isNotBlank($value) ? [$value] : []
  }

  async function updateSelected (..._: any) {
    if (multiple) {
      const ids = valueAsArray($value)
      if (ids.length === selectedItems.length && selectedItems.every((itm, i) => itm.id === ids[i])) return
      const valueBeforeFind = $value
      const resolved = await Promise.all(ids.map(async id => await chooserClient.findById(rootTemplateKey, id)))
      if ($value !== valueBeforeFind) return
      // keep unresolvable values around in case the item comes back or the user
      // simply may not see it right now; they can still edit or remove the selections
      selectedItems = ids.map((id, i) => resolved[i] ?? { broken: true, id })
      const first = resolved.find(isNotNull)
      if (first) {
        initialPath = first.path ?? initialPath
        initialSource = first.source ?? initialSource
      }
    } else if (selectedItem?.id !== $value) {
      if (!$value) {
        selectedItem = undefined
        return
      }
      const valueBeforeFind = $value
      const item = await chooserClient.findById(rootTemplateKey, $value as string)
      if ($value !== valueBeforeFind) return
      // keep unresolvable values around in case the item comes back or the user
      // simply may not see it right now; they can still replace or remove it
      selectedItem = item ?? { broken: true, id: $value as string }
      if (item) {
        initialPath = item.path ?? initialPath
        initialSource = item.source ?? initialSource
      }
    }
  }
  $: void updateSelected($value)
  $: resolvedSelections = selectedItems.filter(itm => !('broken' in itm)) as DataChooserItem[]
</script>

<FieldStandard bind:id {path} {descid} {label} {defaultValue} {conditional} {required} {related} {helptext} let:value let:messagesid let:helptextid let:setVal>
  {#if multiple && selectedItems.length}
    <div class="dialog-data-chooser-container">
      <div class="dialog-data-chooser-icon">
        <Icon icon={databaseIcon} width="3em" />
      </div>
      <div class="dialog-data-chooser-right">
        <div class="dialog-data-chooser-summary">{describeSelections(selectedItems)} selected</div>
        <div class="actions">
          <button type="button" on:click={show} aria-describedby={getDescribedBy([descid, messagesid, helptextid, extradescid])}>
            <Icon icon={pencilOutline} inline /> Edit
          </button>
          <button type="button" on:click={removeAll(setVal)} aria-describedby={getDescribedBy([descid, messagesid, helptextid, extradescid])}>
            <Icon icon={deleteOutline} inline /> Remove All
          </button>
        </div>
      </div>
    </div>
  {:else if !multiple && selectedItem}
    <div class="dialog-data-chooser-container">
      <div class="dialog-data-chooser-icon">
        {#if 'broken' in selectedItem}
          <Icon icon={linkVariantOff} width="3em" />
        {:else}
          <Icon icon={selectedItem.icon?.icon ?? databaseIcon} width="3em" />
        {/if}
      </div>
      <div class="dialog-data-chooser-right">
        <DataDetails item={selectedItem} singleLine />
        <div class="actions">
          <button type="button" on:click={show} aria-describedby={getDescribedBy([descid, messagesid, helptextid, extradescid])}>
            <Icon icon={arrowClockwiseFill} inline /> Replace
          </button>
          <button type="button" on:click={() => { selectedItem = undefined; setVal(undefined) }} aria-describedby={getDescribedBy([descid, messagesid, helptextid, extradescid])}>
            <Icon icon={deleteOutline} inline /> Remove
          </button>
        </div>
      </div>
    </div>
  {:else}
    <div class="dialog-data-chooser-entry">
      <button type="button" on:click={show} aria-describedby={getDescribedBy([descid, messagesid, helptextid, extradescid])}>Select {#if value}New {/if}Data</button>
    </div>
  {/if}
  {#if modalshown}
    <DataChooser {store} {label} {rootTemplateKey} {initialSource} {initialPath} {activeSources} {passthruFilters} {filter} {disable} {publishedOnly} {previewAllowHtml} {previewFormat} {required} {multiple} {selectableFolders} preloadSelections={resolvedSelections} on:change={onChange(setVal)} on:escape={hide} />
  {/if}
</FieldStandard>

<style>
  .dialog-data-chooser-container {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 0.25em;
    font-size: 0.9em;
    align-items: flex-start;
  }
  :global([data-eq~="400px"]) .dialog-data-chooser-container {
    flex-direction: column;
  }
  .dialog-data-chooser-icon {
    width: 3em;
    margin-right: 0.5em;
  }
  .dialog-data-chooser-right {
    max-width: calc(100% - 3.5em);
    flex-grow: 1;
  }
  :global([data-eq~="400px"]) .dialog-data-chooser-right {
    max-width: unset;
  }
  .dialog-data-chooser-summary {
    padding: 0.4em 0;
  }
  .dialog-data-chooser-right .actions {
    display: flex;
  }
  .dialog-data-chooser-right button {
    border: 0;
    border-radius: 0.2em;
    cursor: pointer;
    padding: 0.4em;
    background: none;
    display: flex;
    align-items: center;
    gap: 2px;
  }
  .dialog-data-chooser-right button:hover {
    background-color: #cccccc;
  }
  .dialog-data-chooser-entry {
    display: flex;
    align-items: flex-start;
    margin-top: 0.2em;
    gap: 0.3em;
  }
  :global([data-eq~="400px"]) .dialog-data-chooser-entry {
    flex-direction: column;
    align-items: center;
  }
  .dialog-data-chooser-entry > button {
    border-radius: 0.25em;
    border: 0;
    background-color: var(--dg-button-bg, #501214);
    color: var(--dg-button-text, #fff);
    padding: 0.4em 1em;
    font-size: 0.8em;
  }
</style>
