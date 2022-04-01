<script lang="ts">
  import fileTree from '@iconify/icons-mdi/file-tree.js'
  import viewGrid from '@iconify/icons-mdi/view-grid.js'
  import { Loading, Modal } from '@txstate-mws/svelte-components'
  import { derivedStore } from '@txstate-mws/svelte-store'
  import { createEventDispatcher, getContext, onMount, setContext } from 'svelte'
  import { hashid, randomid } from 'txstate-utils'
  import Asset from './Asset.svelte'
  import AssetFolder from './AssetFolder.svelte'
  import ButtonGroup from '../ButtonGroup.svelte'
  import type { ChooserType, Client } from './ChooserAPI'
  import { ASSET_STORE_CONTEXT, ChooserStore } from './ChooserStore'
  import Details from './Details.svelte'
  import Icon from '../Icon.svelte'
  import Page from './Page.svelte'
  import Thumbnail from './Thumbnail.svelte'
  import { ASSET_API_CONTEXT } from '$lib/Form.svelte'

  const chooserClient = getContext<Client>(ASSET_API_CONTEXT)

  export let label: string|undefined = undefined
  export let images = false
  export let pages = false
  export let assets = images
  export let folders = false
  export let initialType: ChooserType|undefined = undefined
  export let initialSource: string|undefined = undefined
  export let initialPath: string|undefined = undefined
  export let activeSources: string[]|undefined = undefined
  export let store = new ChooserStore(chooserClient)

  setContext(ASSET_STORE_CONTEXT, store)

  $: if (!pages && !assets) assets = true
  $: activeTypes = [...(assets ? ['asset'] : []), ...(pages ? ['page'] : [])] as ChooserType[]

  const dispatch = createEventDispatcher()

  const sources = derivedStore(store, v => v.sources?.[v.activetype] ?? [])
  const source = derivedStore(store, v => store.getSource(v))
  const preview = derivedStore(store, 'preview')

  const chooserheadid = randomid()
  const listid = randomid()

  function onChoose () {
    dispatch('change', $store.preview)
  }

  onMount(async () => {
    await store.init({ activeTypes, activeSources, initialType, initialSource, initialPath, onlyImages: images, chooseFolder: folders })
    if ($store.focus) document.getElementById(hashid($store.focus))?.scrollIntoView()
  })
</script>

<Modal on:escape>
  <section class="dialog-chooser-window">
    <header>
      <div class="dialog-chooser-controls">
        {#if activeTypes.length > 1}
          <ButtonGroup value={$store.activetype} choices={[{ value: 'asset', label: 'Assets' }, { value: 'page', label: 'Pages' }]} ariaControls={listid} on:change={e => store.setActiveType(e.detail)} />
        {/if}
        {#if $sources.length > 1}
          <div class="dialog-chooser-source">
            <select on:change={function () { store.changeSource(Number(this.value)) }}>
              {#each $sources as source, i}
                <option value={i}>{source.name}</option>
              {/each}
            </select>
          </div>
        {/if}
      </div>
      <div id={chooserheadid} class="dialog-chooser-label">
        {label}
      </div>
      {#if $source?.type === 'asset'}
        <div class="dialog-chooser-view">
          <button type="button"><Icon icon={fileTree} /></button>
          <button type="button"><Icon icon={viewGrid} /></button>
        </div>
      {/if}
    </header>
    <section class="dialog-chooser-chooser">
      <Loading loading={!$source || !$source.children}>
        <ul id={listid} class="dialog-chooser-list" role="tree" aria-labelledby={chooserheadid}>
          {#each $source.children as child, i (child.id)}
            {@const setsize = $source.children.length}
            {@const posinset = i + 1}
            {@const prev = $source.children[i - 1]}
            {@const next = $source.children[i + 1]}
            {#if child.type === 'folder'}
              <AssetFolder folder={child} {setsize} {posinset} level={1} {prev} {next} on:choose={onChoose} />
            {:else if child.type === 'page'}
              <Page page={child} {setsize} {posinset} level={1} {prev} {next} on:choose={onChoose} />
            {:else}
              <Asset asset={child} {setsize} {posinset} level={1} {prev} {next} on:choose={onChoose} />
            {/if}
          {/each}
        </ul>
      </Loading>
    </section>
    <section class="dialog-chooser-preview" tabindex={$preview ? 0 : -1}>
      {#if $preview}
        <Thumbnail item={$preview} />
        <Details item={$preview}>
          {#if $preview.type === 'folder'}
            <li>{$preview.children?.length || 0} sub-items</li>
          {/if}
        </Details>
      {/if}
    </section>
    <footer>
      <button type="button" on:click={() => dispatch('escape')}>Cancel</button>
      <button type="button" disabled={!$store.preview} on:click={onChoose}>Choose</button>
    </footer>
  </section>
</Modal>

<style>
  .dialog-chooser-window {
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
  .dialog-chooser-window * {
    box-sizing: border-box;
  }
  .dialog-chooser-chooser {
    position: relative;
    width: 70%;
    height: calc(100% - 4em);
    background-color: white;
    padding: 0.5em;
    overflow: auto;
  }
  .dialog-chooser-preview {
    width: 30%;
    height: calc(100% - 4em);
    padding: 1em;
    overflow-y: auto;
  }
  header {
    width: 100%;
    height: 2em;
    text-align: center;
    font-weight: bold;
    display: flex;
    align-items: center;
  }
  .dialog-chooser-label {
    flex-grow: 1;
  }
  .dialog-chooser-controls {
    display: flex;
  }
  .dialog-chooser-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .dialog-chooser-list :global(li) {
    line-height: 1;
    padding: 0.25em 0;
    border-bottom: 1px solid var(--asset-chooser-border, #AAAAAA);
  }
  .dialog-chooser-list :global(.isPreview) {
    background-color: var(--asset-chooser-active-bg, #333333);
    color: var(--asset-chooser-active, #FFFFFF);
  }

</style>
