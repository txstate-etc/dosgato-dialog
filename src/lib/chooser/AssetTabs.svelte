<script lang="ts">
  import { bytesToHuman } from 'txstate-utils'
  import type { Asset } from './ChooserAPI'
  import { Dialog, FieldTextArea } from '$lib'
  import Button from '$lib/Button.svelte'
  import Icon from '$lib/Icon.svelte'
  import outIcon from '@iconify-icons/ph/arrow-square-out-bold'
  import warningIcon from '@iconify-icons/ph/warning'
  import { getContext } from 'svelte'
  import type { Client } from './ChooserAPI'
  import { CHOOSER_API_CONTEXT } from './ChooserAPI'

  export let id: string
  export let selectedAsset: Asset
  export let showMetadata: boolean = false
  export let altTextRequired: boolean = false
  // if they say it's required but don't provide a path, default to 'altText'
  export let altTextPath: string | undefined = altTextRequired ? 'altText' : undefined
  const chooserClient = getContext<Client>(CHOOSER_API_CONTEXT)

  let tabListEl: HTMLUListElement
  let manageAssetsModalOpen = false

  $: isImage = selectedAsset?.image !== undefined

  $: useTabs = (isImage && altTextPath) || showMetadata

  $: tabs = [
    ...(isImage && altTextPath ? [{ id: `${id}-alttext`, label: 'Alternate Text' }] : []),
    { id: `${id}-details`, label: 'Asset Details' },
    ...(showMetadata ? [{ id: `${id}-metadata`, label: 'Metadata' }] : [])
  ]
  $: activeTab = tabs ? tabs[0].id : 0
  let focusedTabIdx = 0

  function selectTab(tabId: string) {
    activeTab = tabId
    focusedTabIdx = tabs.findIndex(t => t.id === tabId)
    // ensure the focused tab is visible
    const tabEls = tabListEl.querySelectorAll(`[role="tab"][data-tab-asset]`)
    tabEls[focusedTabIdx]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center'})
  }

  function focusTab(idx: number) {
    focusedTabIdx = idx
    activeTab = tabs[idx].id
    const tabEls = tabListEl.querySelectorAll(`[role="tab"][data-tab-asset]`)
    if (tabEls[idx]) (tabEls[idx] as HTMLElement).focus()
    tabEls[idx]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center'})
  }

  function onTabKeydown(e: KeyboardEvent, idx: number) {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      focusTab((idx + 1) % tabs.length)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      focusTab((idx - 1 + tabs.length) % tabs.length)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      selectTab(tabs[idx].id)
    }
  }

  async function navigateToManageAsset() {
    manageAssetsModalOpen = false
    const url = chooserClient.idToEditingUrl ? await chooserClient.idToEditingUrl(selectedAsset.id) : undefined
    if (url) {
      window.location.assign(url)
    }
  }
</script>

{#if useTabs}
  <ul bind:this={tabListEl} class="tabs" role="tablist">
    {#each tabs as tab, idx}
      <li
        id="{tab.id}-tab"
        class="tab {activeTab === tab.id ? 'active' : ''}"
        role="tab"
        aria-selected={activeTab === tab.id}
        aria-controls={tab.id}
        tabindex={focusedTabIdx === idx ? 0 : -1}
        data-tab-asset
        on:click={() => selectTab(tab.id)}
        on:keydown={(e) => onTabKeydown(e, idx)}
        on:focus={() => { focusedTabIdx = idx }}
      >
        <span>{tab.label}</span>
      </li>
    {/each}
  </ul>

  {#if activeTab === `${id}-alttext`}
    <div id={`${id}-alttext`} class="tab-content" role="tabpanel" aria-labelledby="{id}-alttext-tab">
      {#if altTextPath}<FieldTextArea required={altTextRequired} path={altTextPath} label="Alt. Text" helptext="Describes the asset for visually-impaired users and search engines."/>{/if}
    </div>
  {/if}
{/if}
{#if activeTab === `${id}-details` || !useTabs}
  <div id={`${id}-details`} class="tab-content" role="tabpanel" aria-labelledby="{id}-details-tab">
    <div class="details">
      <div class="path">
        <span class="chooser-label">Path:</span>
        <span class="chooser-data">{selectedAsset.path}</span>
      </div>
      {#if selectedAsset.image}
        <div>
          <span class="chooser-label">Dimensions:</span>
          <span class="chooser-data">{selectedAsset.image.width}x{selectedAsset.image.height}</span>
        </div>
      {/if}
      <div>
        <span class="chooser-label">File Type:</span>
        <span class="chooser-data">{selectedAsset.mime}</span>
      </div>
      <div>
        <span class="chooser-label">File Size:</span>
        <span class="chooser-data">{bytesToHuman(selectedAsset.bytes)}</span>
      </div>
      {#if chooserClient.idToEditingUrl}
        <Button on:click={() => { manageAssetsModalOpen = true }}>
          <span class="manage-in-assets">
        Manage in Assets
        <Icon icon={outIcon} />
          </span>
        </Button>
      {/if}
    </div>
  </div>
{/if}
{#if activeTab === `${id}-metadata`}
  <div id={`${id}-metadata`} class="tab-content" role="tabpanel" aria-labelledby="{id}-metadata-tab">
    <slot name="metadata" {selectedAsset} />
  </div>
{/if}
{#if manageAssetsModalOpen}
  <Dialog
    title="Leave Dialog?"
    size="small"
    on:escape={() => { manageAssetsModalOpen = false }}
    on:continue={navigateToManageAsset}
    continueText="Manage Asset"
    cancelText="Go Back"
    icon={warningIcon}>
    <p>Any changes made in the previous window may not be saved. Do you wish to continue?</p>
  </Dialog>
{/if}

<style>
  .tabs {
    list-style: none;
    display: flex;
    gap: 10px;
    margin: 0;
    padding-inline: 0.375em;
    background-color: var(--dg-dialog-header-bg, #ddd);
    max-width: 100%;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .tabs .tab {
    background-color: #ebebeb;
    color: #696969;
    font-weight: 600;
    padding: 0.5em 0.75em 0.125em;
    border: 1px solid #ccced1;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }
   .tabs .tab span{
    white-space: nowrap;
   }
  .tabs .tab[aria-selected="true"] {
    background-color: #f7f7f7;
    color: #000;
    border-bottom-color: #f7f7f7;
  }
  .tab-content {
    padding: 1em 1em 1em 1.125em;  /* left padding to align with tab text, which is 0.75em + 0.375em */
  }
  .tab-content .details {
    display: flex;
    flex-wrap: wrap;
    column-gap: 1.5em;
    row-gap: 0.5em;
  }
  .tab-content .details > div {
    display: flex;
    flex-direction: column;
  }
  .tab-content .path {
    flex-basis: 100%;
  }
  .tab-content .chooser-label {
    font-weight: 600;
    margin-right: 0.5em;
  }
  .manage-in-assets {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4em;
  }
</style>