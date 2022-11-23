<script lang="ts">
  import { FORM_CONTEXT, type FormStore } from '@txstate-mws/svelte-forms'
  import { getContext } from 'svelte'
  import { randomid } from 'txstate-utils'
  import { Chooser, ChooserStore, CHOOSER_API_CONTEXT, type RawURL } from './chooser'
  import type { AnyItem, ChooserType, Client } from './chooser/ChooserAPI'
  import Details from './chooser/Details.svelte'
  import Thumbnail from './chooser/Thumbnail.svelte'
  import FieldStandard from './FieldStandard.svelte'
  import { getDescribedBy } from '$lib'

  export let id: string | undefined = undefined
  export let path: string
  export let label: string = ''
  export let defaultValue: boolean|undefined = undefined
  export let conditional: boolean|undefined = undefined
  export let required = false
  export let images = false
  export let pages = false
  export let assets = images
  export let folders = false
  export let urlEntry = false
  export let initialSource: string|undefined = undefined
  export let initialPath: string|undefined = undefined
  export let helptext: string | undefined = undefined

  const formStore = getContext<FormStore>(FORM_CONTEXT)
  const value = formStore.getField<string>(path)
  const chooserClient = getContext<Client>(CHOOSER_API_CONTEXT)
  const store = new ChooserStore(chooserClient)

  const descid = randomid()
  let modalshown = false
  async function show () {
    if (selectedAsset && selectedAsset.type !== 'raw') store.setPreview(selectedAsset)
    modalshown = true
  }
  function hide () {
    modalshown = false
  }
  function onChange (setVal: any) {
    return (e) => {
      selectedAsset = e.detail
      setVal(selectedAsset?.id)
      hide()
    }
  }

  async function userUrlEntry () {
    const url = this.value
    if (chooserClient.findByUrl) {
      const item = await chooserClient.findByUrl(url)
      if (item) return store.setPreview(item)
    }
    store.clearPreview()
    const newVal = chooserClient.urlToValue?.(url) ?? url
    selectedAsset = {
      type: 'raw',
      id: newVal,
      url
    }
    formStore.setField(path, newVal)
  }

  let selectedAsset: AnyItem|RawURL
  async function updateSelected (..._: any) {
    if ($value && selectedAsset?.id !== $value) selectedAsset = await chooserClient.findById($value)
  }
  $: updateSelected($value)
</script>

<FieldStandard bind:id {path} {descid} {label} {defaultValue} {conditional} {required} {helptext} let:value let:messagesid let:helptextid let:valid let:invalid let:id let:onBlur let:setVal>
  {#if selectedAsset}
    <div class="dialog-chooser-container">
      <Thumbnail item={selectedAsset} />
      <Details item={selectedAsset} />
    </div>
  {/if}
  <div class="dialog-chooser-entry">
    {#if urlEntry && !folders && selectedAsset?.type !== 'folder'}
      <input type="text" value={selectedAsset?.url ?? ''} on:change={userUrlEntry}>
    {/if}
    <button type="button" on:click={show} aria-describedby={getDescribedBy([descid, messagesid, helptextid])}>Select {#if value}New{/if} {#if assets && pages}Link Target{:else if images}Image{:else if assets}Asset{:else}Page{/if}</button>
  </div>
  {#if modalshown}
    <Chooser {store} {label} {pages} {assets} {images} {initialSource} {initialPath} {folders} {required} on:change={onChange(setVal)} on:escape={hide} />
  {/if}
</FieldStandard>

<style>
  .dialog-chooser-container {
    display: flex;
    margin-bottom: 0.25em;
    font-size: 0.9em;
  }
  div.dialog-chooser-container > :global(.dialog-chooser-thumbnail) {
    width: 8em;
    padding-top: 0;
    height: 5em;
  }
  .dialog-chooser-entry {
    display: flex;
  }
  input {
    flex-grow: 1;
  }
</style>
