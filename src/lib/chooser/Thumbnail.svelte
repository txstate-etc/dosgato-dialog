<script lang="ts">
  import folderOutline from '@iconify-icons/mdi/folder-outline.js'
  import fileLinkOutline from '@iconify-icons/mdi/file-link-outline.js'
  import FileIcon from '$lib/FileIcon.svelte'
  import Icon from '$lib/Icon.svelte'
  import type { AnyItem } from './ChooserAPI'
  import type { BrokenURL, RawURL } from './ChooserStore'
  import { ScreenReaderOnly } from '@txstate-mws/svelte-components'
  import { collapseIconSVG, expandIconSVG } from './icons'
  import { createEventDispatcher } from 'svelte'

  export let item: AnyItem | RawURL | BrokenURL
  export let larger = false
  export let expandable = false
  export let expanded = false
  const dispatch = createEventDispatcher()

  function toggleThumbnailSize () {
    dispatch('thumbnailsizechange')
  }
</script>
<div class="dialog-chooser-thumbnail" class:expanded>
  {#if item.type === 'asset'}
    {#if item.image}
      <div style="position: relative; height: 100%;">
        <img src={(larger ? (item.image.previewUrl ?? item.image.thumbnailUrl) : (item.image.thumbnailUrl ?? item.image.previewUrl)) ?? item.url} alt="" />
        {#if expandable}
          <button on:click={toggleThumbnailSize}>
            {@html expanded ? collapseIconSVG : expandIconSVG}
            <ScreenReaderOnly>{expanded ? 'View Image Details' : 'View Full Image'}</ScreenReaderOnly>
          </button>
        {/if}
      </div>
    {:else}
      <div class="file-icon-container">
        <FileIcon mime={item.mime} width='5em' />
      </div>
    {/if}
  {:else if item.type === 'folder'}
    <Icon icon={folderOutline} width='5em' />
  {:else if item.id}
    <Icon icon={fileLinkOutline} width='5em' />
  {/if}
</div>

<style>
  .dialog-chooser-thumbnail {
    position: relative;
    width: 100%;
    margin-right: 0.5em;
    margin-bottom: 0.5em;
  }
  .dialog-chooser-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: scale-down;
    object-position: top;
  }
  .dialog-chooser-thumbnail :global(svg) {
    width: 80%;
    height: 80%;
    object-fit: scale-down;
  }
  .dialog-chooser-thumbnail > :global(*) {
    display: block;
  }
  .dialog-chooser-thumbnail .file-icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .dialog-chooser-thumbnail .file-icon-container :global(svg) {
    width: 100%;
    height: 100%;
  }
  .dialog-chooser-thumbnail button {
    position: absolute;
    left: 0;
    bottom: 0;
    padding: 0;
    background-color: transparent;
    width: 2.5em;
    border: 0;
  }
  .dialog-chooser-thumbnail button :global(svg) {
    width: 100%;
    height: 100%;
  }
</style>
