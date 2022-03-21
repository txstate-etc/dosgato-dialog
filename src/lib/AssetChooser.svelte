<script lang="ts">
  import fileTree from '@iconify/icons-mdi/file-tree'
  import viewGrid from '@iconify/icons-mdi/view-grid'
  import { Loading, Modal } from '@txstate-mws/svelte-components'
  import { derivedStore } from '@txstate-mws/svelte-store'
  import { createEventDispatcher, getContext, onMount } from 'svelte'
  import { hashid, randomid } from 'txstate-utils'
  import Asset from './Asset.svelte'
  import AssetFolder from './AssetFolder.svelte'
  import { ASSET_STORE_CONTEXT, bytesToHuman } from './AssetStore'
  import type { AssetStore } from './AssetStore'
  import FileIcon from './FileIcon.svelte'
  import Icon from './Icon.svelte'

  export let label: string|undefined = undefined

  const dispatch = createEventDispatcher()

  const store = getContext<AssetStore>(ASSET_STORE_CONTEXT)
  const source = derivedStore(store, v => v.sources?.[v.activesource])
  const preview = derivedStore(store, 'preview')

  const chooserheadid = randomid()

  onMount(async () => {
    await store.init()
    if ($store.focus) document.getElementById(hashid($store.focus)).scrollIntoView()
  })
</script>

<Modal on:escape>
  <section class="dialog-asset-window">
    <header>
      <div id={chooserheadid} class="dialog-asset-label">
        {label}
      </div>
      <div class="dialog-asset-controls">
        {#if $store.sources && $store.sources.length > 1}
          <select on:change={function () { store.changeSource(Number(this.value)) }}>
            {#each $store.sources as source, i}
              <option value={i}>{source.name}</option>
            {/each}
          </select>
        {/if}
        <button><Icon icon={fileTree} /></button>
        <button><Icon icon={viewGrid} /></button>
      </div>
    </header>
    <section class="dialog-asset-chooser">
      <Loading loading={!$source || !$source.children}>
        <ul class="dialog-asset-list" role="tree" aria-labelledby={chooserheadid}>
          {#each $source.children as child, i (child.id)}
            {@const setsize = $source.children.length}
            {@const posinset = i + 1}
            {@const prev = $source.children[i - 1]}
            {@const next = $source.children[i + 1]}
            {#if child.type === 'folder'}
              <AssetFolder folder={child} {setsize} {posinset} level={1} {prev} {next} />
            {:else}
              <Asset asset={child} {setsize} {posinset} level={1} {prev} {next} />
            {/if}
          {/each}
        </ul>
      </Loading>
    </section>
    <section class="dialog-asset-preview" tabindex={$preview ? 0 : -1}>
      {#if $preview}
        {#if $preview.image}
          <div class="dialog-asset-thumbnail">
            <img src={$preview.image.thumbnailUrl} alt="" />
          </div>
          <div>{$preview.image.width}x{$preview.image.height}</div>
        {:else}
          <div class="dialog-asset-thumbnail">
            <span class="dialog-asset-preview-icon">
              <FileIcon mime={$preview.mime} width='5em' />
            </span>
          </div>
        {/if}
        <div>{$preview.name}</div>
        <div>{$preview.mime}</div>
        <div>{bytesToHuman($preview.bytes)}</div>
      {/if}
    </section>
    <footer>
      <button on:click={() => dispatch('escape')}>Cancel</button>
      <button disabled={!$store.preview} on:click={() => dispatch('change', $store.preview)}>Choose</button>
    </footer>
  </section>
</Modal>

<style>
  .dialog-asset-window {
    position: relative;
    width: 80vw;
    height: 80vh;
    background-color: lightgray;
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    justify-content: flex-end;
    padding: 1em;
    overflow: hidden;
  }
  .dialog-asset-window * {
    box-sizing: border-box;
  }
  .dialog-asset-chooser {
    position: relative;
    width: 70%;
    height: calc(100% - 4em);
    background-color: white;
    padding: 0.5em;
    overflow: auto;
  }
  .dialog-asset-preview {
    width: 30%;
    height: calc(100% - 4em);
    padding: 1em;
    overflow-y: auto;
  }
  .dialog-asset-thumbnail {
    position: relative;
    width: 100%;
    padding-top: 75%;
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
  .dialog-asset-thumbnail span {
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  header {
    width: 100%;
    height: 2em;
    text-align: center;
    font-weight: bold;
    display: flex;
    align-items: center;
  }
  .dialog-asset-label {
    flex-grow: 1;
  }
  .dialog-asset-controls {
    display: flex;
  }
  .dialog-asset-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
</style>
