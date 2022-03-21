<script lang="ts" context="module">
  import type { Client } from './AssetAPI'
</script>
<script lang="ts">
  import folderOpenOutline from '@iconify/icons-mdi/folder-open-outline'
  import { FORM_CONTEXT, type FormStore } from '@txstate-mws/svelte-forms'
  import { getContext, onMount, setContext } from 'svelte'
  import { randomid } from 'txstate-utils'
  import AssetChooser from './AssetChooser.svelte'
  import { AssetStore, ASSET_STORE_CONTEXT, bytesToHuman } from './AssetStore'
  import FieldStandard from './FieldStandard.svelte'
  import FileIcon from './FileIcon.svelte'
  import { ASSET_API_CONTEXT } from './Form.svelte'
  import Icon from './Icon.svelte'

  export let id: string | undefined = undefined
  export let path: string
  export let label: string = ''
  export let defaultValue: boolean|undefined = undefined
  export let conditional: boolean|undefined = undefined
  export let required = false
  export let initialSource: string|undefined = undefined
  export let initialPath: string|undefined = undefined

  const formStore = getContext<FormStore>(FORM_CONTEXT)
  const value = formStore.getField<string>(path)
  const assetClient = getContext<Client>(ASSET_API_CONTEXT)
  const store = new AssetStore(assetClient, { initWithSource: initialSource, initWithPath: initialPath })
  setContext(ASSET_STORE_CONTEXT, store)

  const descid = randomid()
  let modalshown = false
  async function show () {
    store.preview(selectedAsset)
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

  let selectedAsset
  async function updateSelected (..._: any) {
    if ($value && selectedAsset?.id !== $value) selectedAsset = await assetClient.findById($value)
  }
  $: updateSelected($value)
</script>

<FieldStandard bind:id {path} {descid} {label} {defaultValue} {conditional} {required} let:value let:messagesid let:valid let:invalid let:id let:onBlur let:setVal>
  {#if selectedAsset}
    <div class="dialog-asset-container">
      {#if selectedAsset.type === 'asset'}
        {#if selectedAsset.image}
          <div class="dialog-asset-thumbnail">
            <img src={selectedAsset.image.thumbnailUrl} alt="" />
          </div>
        {:else}
          <div class="dialog-asset-thumbnail">
            <span class="dialog-asset-preview-icon">
              <FileIcon mime={selectedAsset.mime} width='5em' />
            </span>
          </div>
        {/if}
      {:else}
        <div class="dialog-asset-thumbnail">
          <span class="dialog-asset-preview-icon">
            <Icon icon={folderOpenOutline} width='3em' />
          </span>
        </div>
      {/if}
      <ul class="dialog-asset-info">
        {#if selectedAsset.type === 'asset' && selectedAsset.image}
          <li>{selectedAsset.image.width}x{selectedAsset.image.height}</li>
        {/if}
        <li>{selectedAsset.name}</li>
        {#if selectedAsset.type === 'asset'}
          <li>{selectedAsset.mime}</li>
          <li>{bytesToHuman(selectedAsset.bytes)}</li>
        {/if}
      </ul>
    </div>
  {/if}
  <button on:click={show} aria-describedby={messagesid}>{#if value}Replace{:else}Choose{/if} Asset</button>
  {#if modalshown}
    <AssetChooser {label} on:change={onChange(setVal)} on:escape={hide} />
  {/if}
</FieldStandard>

<style>
  .dialog-asset-container {
    display: flex;
  }
  .dialog-asset-thumbnail {
    position: relative;
    width: 8em;
    height: 5em;
  }
  img {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    object-fit: scale-down;
  }
  .dialog-asset-info {
    padding: 0;
    margin: 0;
    list-style: none;
  }
</style>
