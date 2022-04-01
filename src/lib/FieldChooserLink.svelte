<script lang="ts" context="module">
  import type { ChooserType, Client } from './chooser/ChooserAPI'
</script>
<script lang="ts">
  import { FORM_CONTEXT, type FormStore } from '@txstate-mws/svelte-forms'
  import { getContext } from 'svelte'
  import { randomid } from 'txstate-utils'
  import { Chooser, ChooserStore, CHOOSER_API_CONTEXT, type AnyUIItem, type RawURL } from './chooser'
  import Details from './chooser/Details.svelte'
  import Thumbnail from './chooser/Thumbnail.svelte'
  import FieldStandard from './FieldStandard.svelte'

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
  export let initialType: ChooserType|undefined = undefined
  export let initialSource: string|undefined = undefined
  export let initialPath: string|undefined = undefined

  const formStore = getContext<FormStore>(FORM_CONTEXT)
  const value = formStore.getField<string>(path)
  const chooserClient = getContext<Client>(CHOOSER_API_CONTEXT)
  const store = new ChooserStore(chooserClient)

  const descid = randomid()
  let modalshown = false
  async function show () {
    if (selectedAsset && selectedAsset.type !== 'raw') store.preview(selectedAsset)
    modalshown = true
  }
  function hide () {
    modalshown = false
  }
  function onChange (setVal: any) {
    return (e) => {
      selectedAsset = e.detail
      setVal(e.detail.id)
      hide()
    }
  }

  async function userUrlEntry () {
    const url = this.value
    if (chooserClient.findByUrl) {
      const item = await chooserClient.findByUrl(url)
      if (item) return store.preview(item)
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

  let selectedAsset: AnyUIItem|RawURL
  async function updateSelected (..._: any) {
    if ($value && selectedAsset?.id !== $value) selectedAsset = await chooserClient.findById($value)
  }
  $: updateSelected($value)
</script>

<FieldStandard bind:id {path} {descid} {label} {defaultValue} {conditional} {required} let:value let:messagesid let:valid let:invalid let:id let:onBlur let:setVal>
  {#if selectedAsset}
    <div class="dialog-chooser-container">
      <Thumbnail item={selectedAsset} />
      <Details item={selectedAsset} />
    </div>
  {/if}
  <button type="button" on:click={show} aria-describedby={messagesid}>Select {#if value}New{/if} {#if assets && pages}Link Target{:else if images}Image{:else if assets}Asset{:else}Page{/if}</button>
  {#if urlEntry && !folders && selectedAsset?.type !== 'folder'}
    <input type="text" value={selectedAsset?.url ?? ''} on:change={userUrlEntry}><br>
  {/if}
  {#if modalshown}
    <Chooser {store} {label} {initialType} {pages} {assets} {images} {initialSource} {initialPath} {folders} on:change={onChange(setVal)} on:escape={hide} />
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
  input {
    width: 100%;
  }
</style>
