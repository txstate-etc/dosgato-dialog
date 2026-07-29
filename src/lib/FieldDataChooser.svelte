<script lang="ts">
  import arrowClockwiseFill from '@iconify-icons/ph/arrow-clockwise-fill'
  import databaseIcon from '@iconify-icons/ph/database'
  import deleteOutline from '@iconify-icons/mdi/delete'
  import linkVariantOff from '@iconify-icons/mdi/link-variant-off'
  import { FORM_CONTEXT, FORM_INHERITED_PATH, type FormStore } from '@txstate-mws/svelte-forms'
  import { getContext } from 'svelte'
  import { isNotBlank, randomid } from 'txstate-utils'
  import { DATA_CHOOSER_API_CONTEXT, type DataChooserClient, type DataChooserItem, type UnknownDataItem } from './datachooser/DataChooserAPI'
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
  export let defaultValue: string | undefined = undefined
  export let conditional: boolean | undefined = undefined
  export let required = false
  /**
   * Arbitrarily restrict which items may be chosen, e.g. to specific types of data
   * by templateKey. Return false for a container to hide it and everything beneath
   * it - so a filter targeting templateKey should return true for items without one.
   */
  export let filter: undefined | ((item: DataChooserItem) => boolean | Promise<boolean>) = undefined
  /**
   * Passed through to the DataChooserClient on every fetch, in case the
   * implementing application supports extra filtering options.
   */
  export let passthruFilters: any = undefined
  /** Restrict the chooser to a subset of the client's sources for this rootTemplateKey. */
  export let activeSources: string[] | undefined = undefined
  export let initialSource: string | undefined = undefined
  export let initialPath: string | undefined = undefined
  export let related: true | number = 0
  export let extradescid: string | undefined = undefined
  export let helptext: string | undefined = undefined
  export let selectedItem: DataChooserItem | UnknownDataItem | undefined = undefined

  const formStore = getContext<FormStore>(FORM_CONTEXT)
  const inheritedPath = getContext<string>(FORM_INHERITED_PATH)
  const finalPath = [inheritedPath, path].filter(isNotBlank).join('.')
  const value = formStore.getField<string>(finalPath)
  const chooserClient = getContext<DataChooserClient>(DATA_CHOOSER_API_CONTEXT)
  const store = new DataChooserStore(chooserClient)

  const descid = randomid()
  let modalshown = false
  function show () {
    if (selectedItem && !('broken' in selectedItem)) store.setPreview(selectedItem)
    modalshown = true
  }
  function hide () {
    modalshown = false
  }
  function onChange (setVal: any) {
    return (e: CustomEvent<{ preview: DataChooserItem | undefined }>) => {
      selectedItem = e.detail.preview
      setVal(selectedItem?.id)
      hide()
    }
  }

  async function updateSelected (..._: any) {
    if (selectedItem?.id !== $value) {
      if (!$value) {
        selectedItem = undefined
        return
      }
      const valueBeforeFind = $value
      const item = await chooserClient.findById(rootTemplateKey, $value)
      if ($value !== valueBeforeFind) return
      // keep unresolvable values around in case the item comes back or the user
      // simply may not see it right now; they can still replace or remove it
      selectedItem = item ?? { broken: true, id: $value }
      if (item) {
        initialPath = item.path ?? initialPath
        initialSource = item.source ?? initialSource
      }
    }
  }
  $: void updateSelected($value)
</script>

<FieldStandard bind:id {path} {descid} {label} {defaultValue} {conditional} {required} {related} {helptext} let:value let:messagesid let:helptextid let:setVal>
  {#if selectedItem}
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
    <DataChooser {store} {label} {rootTemplateKey} {initialSource} {initialPath} {activeSources} {passthruFilters} {filter} {required} on:change={onChange(setVal)} on:escape={hide} />
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
