<script lang="ts">
  import arrowClockwiseFill from '@iconify-icons/ph/arrow-clockwise-fill'
  import deleteOutline from '@iconify-icons/mdi/delete-outline'
  import xCircle from '@iconify-icons/ph/x-circle'
  import { FORM_CONTEXT, FORM_INHERITED_PATH, type FormStore } from '@txstate-mws/svelte-forms'
  import { getContext } from 'svelte'
  import { isBlank, isNotBlank, randomid } from 'txstate-utils'
  import { Chooser, ChooserStore, CHOOSER_API_CONTEXT, cleanUrl, type BrokenURL, type RawURL } from './chooser'
  import type { AnyItem, Client } from './chooser/ChooserAPI'
  import Details from './chooser/Details.svelte'
  import Thumbnail from './chooser/Thumbnail.svelte'
  import { getDescribedBy, FieldStandard, InlineMessage, Icon } from '$lib'

  export let id: string | undefined = undefined
  export let path: string
  export let label: string = ''
  export let defaultValue: boolean | undefined = undefined
  export let conditional: boolean | undefined = undefined
  export let required = false
  export let images = false
  export let pages = false
  export let assets = images
  export let folders = false
  export let urlEntry = false
  export let initialSource: string | undefined = undefined
  export let initialPath: string | undefined = undefined
  export let related: true | number = 0
  export let extradescid: string | undefined = undefined
  export let helptext: string | undefined = undefined
  export let selectedAsset: AnyItem | RawURL | BrokenURL | undefined = undefined

  // TODO: add a mime type acceptance prop, maybe a regex or function, to prevent users from
  // choosing unacceptable mime types

  const formStore = getContext<FormStore>(FORM_CONTEXT)
  const inheritedPath = getContext<string>(FORM_INHERITED_PATH)
  const finalPath = [inheritedPath, path].filter(isNotBlank).join('.')
  const value = formStore.getField<string>(finalPath)
  const chooserClient = getContext<Client>(CHOOSER_API_CONTEXT)
  const store = new ChooserStore(chooserClient)
  let urlEntryInput: HTMLInputElement | undefined

  const descid = randomid()
  let modalshown = false
  async function show () {
    if (selectedAsset && selectedAsset.type !== 'raw' && selectedAsset.type !== 'broken') store.setPreview(selectedAsset)
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
  function clearUrlEntry () {
    urlEntryInput!.value = ''
    urlEntryInput!.dispatchEvent(new InputEvent('input'))
  }

  let timer: ReturnType<typeof setTimeout>
  function userUrlEntry () {
    clearTimeout(timer)
    timer = setTimeout(userUrlEntryDebounced.bind(this), 300)
  }

  async function userUrlEntryDebounced () {
    const url = this.value
    const cleanedUrl = cleanUrl(url)
    store.clearPreview()
    if (isBlank(url)) {
      selectedAsset = undefined
      void formStore.setField(finalPath, undefined)
      return
    }
    let found = false
    if (chooserClient.findByUrl) {
      let item = await chooserClient.findByUrl(url)
      if (!item && isNotBlank(cleanedUrl)) item = await chooserClient.findByUrl(cleanedUrl)
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
      if (urlToValueCache[url]) {
        selectedAsset = { type: 'raw', id: urlToValueCache[url], url }
      } else {
        if (isBlank(cleanedUrl) || cleanedUrl.startsWith('/')) {
          // here we "select" a raw url so that we do not interrupt the users' typing, but
          // we set its id to 'undefined' so that nothing makes it into the form until it's
          // a valid URL
          selectedAsset = { type: 'raw', id: undefined, url }
        } else {
          selectedAsset = {
            type: 'raw',
            id: chooserClient.urlToValue?.(cleanedUrl) ?? cleanedUrl,
            url
          }
        }
      }
    }
    void formStore.setField(finalPath, selectedAsset?.id)
    formStore.dirtyField(finalPath)
  }

  const urlToValueCache: Record<string, string> = {}
  async function updateSelected (..._: any) {
    if (selectedAsset?.id !== $value) {
      if (!$value) {
        selectedAsset = undefined
        return
      }
      const valueBeforeFind = $value
      const asset = await chooserClient.findById($value)
      if ($value !== valueBeforeFind) return
      selectedAsset = asset
      try {
        if (!selectedAsset) {
          const urlFromValue = chooserClient.valueToUrl?.($value) ?? $value
          const cleanedUrlFromValue = cleanUrl(urlFromValue)
          if (isBlank(cleanedUrlFromValue)) {
            selectedAsset = undefined
          } else if (cleanedUrlFromValue.startsWith('/')) {
            selectedAsset = { type: 'broken', id: $value, url: cleanedUrlFromValue }
          } else {
            selectedAsset = { type: 'raw', id: $value, url: cleanedUrlFromValue }
          }
        }
        if (selectedAsset) {
          urlToValueCache[selectedAsset.url] = $value
          if (selectedAsset.type !== 'raw' && selectedAsset.type !== 'broken') {
            initialPath = selectedAsset.path ?? initialPath
            initialSource = selectedAsset.source ?? initialSource
          }
        }
      } catch (e: any) {
        console.error(e)
      }
    }
  }
  $: void updateSelected($value)
</script>

<FieldStandard bind:id {path} {descid} {label} {defaultValue} {conditional} {required} {related} {helptext} let:value let:messagesid let:helptextid let:valid let:invalid let:id let:onBlur let:setVal>
  {#if selectedAsset?.id}
    <div class="dialog-chooser-container" class:urlEntry>
      <Thumbnail item={selectedAsset} />
      <div class="dialog-chooser-right">
        <Details item={selectedAsset} singleLine />
        {#if !urlEntry}
          <button type="button" on:click={show} aria-describedby={getDescribedBy([descid, messagesid, helptextid, extradescid])}>
            <Icon icon={arrowClockwiseFill} /> Replace
          </button>
          <button type="button" on:click={() => { selectedAsset = undefined; setVal(undefined) }} aria-describedby={getDescribedBy([descid, messagesid, helptextid, extradescid])}>
            <Icon icon={deleteOutline} inline /> Remove
          </button>
        {/if}
    </div>
    </div>
  {/if}
  {#if urlEntry || !selectedAsset?.id}
    <div class="dialog-chooser-entry">
      {#if urlEntry}
        <div class="dialog-chooser-entry-input">
          <input bind:this={urlEntryInput} type="text" data-lpignore="true" value={selectedAsset?.url ?? ''} on:change={userUrlEntry} on:input={userUrlEntry}>
          <button type="button" on:click={clearUrlEntry}><Icon icon={xCircle} hiddenLabel="clear input" inline/></button>
        </div>
      {/if}
      <button type="button" on:click={show} aria-describedby={getDescribedBy([descid, messagesid, helptextid, extradescid])}>Select {#if value}New{/if} {#if assets && pages}Link Target{:else if images}Image{:else if assets}Asset{:else}Page{/if}</button>
    </div>
  {/if}
  {#if selectedAsset?.url.length && !selectedAsset.id}
    <InlineMessage message={{ message: 'Entry does not match an internal resource and is not a valid URL. Nothing will be saved.', type: 'warning' }} />
  {/if}
  {#if modalshown}
    <Chooser {store} {label} {pages} {assets} {images} {initialSource} {initialPath} {folders} {required} on:change={onChange(setVal)} on:escape={hide} />
  {/if}
</FieldStandard>

<style>
  .dialog-chooser-container {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 0.25em;
    font-size: 0.9em;
    align-items: flex-start;
  }
  :global([data-eq~="400px"]) .dialog-chooser-container {
    flex-direction: column;
  }
  div.dialog-chooser-container > :global(.dialog-chooser-thumbnail) {
    width: 8em;
    padding-top: 0;
    height: 5em;
  }
  div.dialog-chooser-container.urlEntry > :global(.dialog-chooser-thumbnail) {
    width: 3em;
    padding-top: 0;
    height: 3em;
  }
  .dialog-chooser-right {
    max-width: calc(100% - 8.5em);
    flex-grow: 1;
  }
  :global([data-eq~="400px"]) .dialog-chooser-right {
    max-width: unset;
  }
  .dialog-chooser-right button {
    margin-top: 0.5em;
    border: 0;
    font-weight: bold;
    border-radius: 0.2em;
    cursor: pointer;
    padding: 0.4em;
    background: none;
  }
  .dialog-chooser-right button:hover {
    background-color: #cccccc;
  }
  .dialog-chooser-entry {
    display: flex;
    align-items: flex-start;
    margin-top: 0.2em;
    gap: 0.3em;
  }
  :global([data-eq~="400px"]) .dialog-chooser-entry {
    flex-direction: column;
    align-items: center;
  }
  .dialog-chooser-entry > button {
    border-radius: 0.25em;
    border: 0;
    background-color: var(--dg-button-bg, #501214);
    color: var(--dg-button-text, #fff);
    padding: 0.4em 1em;
    font-size: 0.8em;
  }
  .dialog-chooser-entry-input {
    position: relative;
    flex-grow: 1;
  }
  :global([data-eq~="400px"]) .dialog-chooser-entry-input {
    width: 100%;
  }
  .dialog-chooser-entry-input input {
    width: 100%;
    padding-right: 1.4em;
  }
  .dialog-chooser-entry-input button {
    display: block;
    border: 0;
    background: none;
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    cursor: pointer;
    line-height: 1;
    color: black;
  }
  :global([data-eq~="400px"] .dialog-chooser-container .dialog-chooser-thumbnail img) {
    object-position: left;
  }
</style>
