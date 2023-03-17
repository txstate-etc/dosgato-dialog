<script lang="ts">
  import { FORM_CONTEXT, FORM_INHERITED_PATH, type FormStore } from '@txstate-mws/svelte-forms'
  import { getContext } from 'svelte'
  import { isNotBlank, randomid } from 'txstate-utils'
  import { Chooser, ChooserStore, CHOOSER_API_CONTEXT, type RawURL } from './chooser'
  import type { AnyItem, Client } from './chooser/ChooserAPI'
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
  export let related: true | number = 0
  export let extradescid: string | undefined = undefined
  export let helptext: string | undefined = undefined
  export let selectedAsset: AnyItem|RawURL|undefined = undefined

  // TODO: add a mime type acceptance prop, maybe a regex or function, to prevent users from
  // choosing unacceptable mime types

  const formStore = getContext<FormStore>(FORM_CONTEXT)
  const inheritedPath = getContext<string>(FORM_INHERITED_PATH)
  const finalPath = [inheritedPath, path].filter(isNotBlank).join('.')
  const value = formStore.getField<string>(finalPath)
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

  let timer: ReturnType<typeof setTimeout>
  function userUrlEntry () {
    clearTimeout(timer)
    timer = setTimeout(userUrlEntryDebounced.bind(this), 300)
  }

  async function userUrlEntryDebounced () {
    const url = this.value
    store.clearPreview()
    let found = false
    if (chooserClient.findByUrl) {
      const item = await chooserClient.findByUrl(url)
      if (url !== this.value) return
      if (item) {
        found = true
        if (
          (item.type === 'page' && !pages) || // they typed the URL for a page but we don't allow pages right now
          (item.type === 'folder' && !folders) || // they typed the URL for an asset folder but not allowed
          (item.type === 'asset' && !assets) || // they typed the URL for an asset but not allowed
          (item.type === 'asset' && !item.image && images) // they typed the URL for a non-image asset but we only want images
        ) {
          // they entered something that is recognized but not allowed
          // they can keep the typing they've done, but the id must be 'undefined' so that nothing
          // is entered into the form data
          selectedAsset = {
            type: 'raw',
            id: undefined,
            url
          }
        } else {
          selectedAsset = { ...item, url } as any
        }
      }
    }
    if (!found) {
      try {
        const _ = new URL(url)
        selectedAsset = {
          type: 'raw',
          id: chooserClient.urlToValue?.(url) ?? url,
          url
        }
      } catch (e: any) {
        // here we "select" a raw url so that we do not interrupt the users' typing, but
        // we set its id to 'undefined' so that nothing makes it into the form until it's
        // a valid URL
        selectedAsset = {
          type: 'raw',
          id: undefined,
          url
        }
      }
    }
    formStore.setField(finalPath, selectedAsset?.id)
    formStore.dirtyField(finalPath)
  }

  async function updateSelected (..._: any) {
    if ($value && selectedAsset?.id !== $value) {
      const valueBeforeFind = $value
      const asset = await chooserClient.findById($value)
      if ($value !== valueBeforeFind) return
      selectedAsset = asset
      try {
        if (!selectedAsset) selectedAsset = { type: 'raw', id: $value, url: chooserClient.valueToUrl?.($value) ?? $value }
      } catch (e: any) {
        console.error(e)
      }
    }
  }
  $: updateSelected($value)
</script>

<FieldStandard bind:id {path} {descid} {label} {defaultValue} {conditional} {required} {related} {helptext} let:value let:messagesid let:helptextid let:valid let:invalid let:id let:onBlur let:setVal>
  {#if selectedAsset}
    <div class="dialog-chooser-container">
      <Thumbnail item={selectedAsset} />
      <Details item={selectedAsset} />
    </div>
  {/if}
  <div class="dialog-chooser-entry">
    {#if urlEntry}
      <input type="text" value={selectedAsset?.url ?? ''} on:change={userUrlEntry} on:keyup={userUrlEntry}>
    {/if}
    <button type="button" on:click={show} aria-describedby={getDescribedBy([descid, messagesid, helptextid, extradescid])}>Select {#if value}New{/if} {#if assets && pages}Link Target{:else if images}Image{:else if assets}Asset{:else}Page{/if}</button>
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
