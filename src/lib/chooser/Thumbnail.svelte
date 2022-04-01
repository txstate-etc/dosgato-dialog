<script lang="ts">
  import folderOutline from '@iconify/icons-mdi/folder-outline.js'
  import fileLinkOutline from '@iconify/icons-mdi/file-link-outline.js'
  import FileIcon from '$lib/FileIcon.svelte'
  import Icon from '$lib/Icon.svelte'
  import type { AnyUIItem, RawURL } from './ChooserStore'

  export let item: AnyUIItem|RawURL
</script>

<div class="dialog-chooser-thumbnail">
  {#if item.type === 'asset'}
    {#if item.image}
      <img src={item.image.thumbnailUrl} alt="" />
    {:else}
      <FileIcon mime={item.mime} width='5em' />
    {/if}
  {:else if item.type === 'folder'}
    <Icon icon={folderOutline} width='5em' />
  {:else}
    <Icon icon={fileLinkOutline} width='5em' />
  {/if}
</div>

<style>
  .dialog-chooser-thumbnail {
    position: relative;
    width: 100%;
    padding-top: 75%;
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: scale-down;
  }
  .dialog-chooser-thumbnail > * {
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>
