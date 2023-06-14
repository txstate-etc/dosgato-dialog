<script lang="ts">
  import folderOutline from '@iconify-icons/mdi/folder-outline.js'
  import fileLinkOutline from '@iconify-icons/mdi/file-link-outline.js'
  import FileIcon from '$lib/FileIcon.svelte'
  import Icon from '$lib/Icon.svelte'
  import type { AnyItem } from './ChooserAPI'
  import type { BrokenURL, RawURL } from './ChooserStore'

  export let item: AnyItem|RawURL|BrokenURL
  export let larger = false
</script>

<div class="dialog-chooser-thumbnail">
  {#if item.type === 'asset'}
    {#if item.image}
      <img src={(larger ? (item.image.previewUrl ?? item.image.thumbnailUrl) : (item.image.thumbnailUrl ?? item.image.previewUrl)) ?? item.url} alt="" />
    {:else}
      <FileIcon mime={item.mime} width='5em' />
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
    padding-top: 75%;
    margin-right: 0.5em;
  }
  .dialog-chooser-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: scale-down;
  }
  .dialog-chooser-thumbnail :global(svg) {
    width: 60%;
    height: 60%;
    min-width: 4.5em;
    min-height: 4.5em;
    object-fit: scale-down;
  }
  .dialog-chooser-thumbnail > :global(*) {
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>
