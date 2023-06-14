<script lang="ts">
  import type { AnyItem } from './ChooserAPI'
  import { bytesToHuman, cleanUrl, type BrokenURL, type RawURL, humanFileType } from './ChooserStore'

  export let item: AnyItem|RawURL|BrokenURL
  export let singleLine = false
</script>

<dl class="dialog-chooser-info" aria-live="polite" class:multiLine={!singleLine} class:asset={item.type === 'asset'}>
  {#if item.type === 'raw' && item.id}
    <div class="top-row">
      <dt>External Link:</dt>
      <dd>{cleanUrl(item.url)}</dd>
    </div>
  {:else if item.type === 'broken'}
    <div class="top-row">
      <dt>Unknown Link (may have been deleted):</dt>
      <dd>{item.url}</dd>
    </div>
  {:else if item.type !== 'raw'}
    <div class="top-row">
      <dt>Name:</dt>
      <dd>{item.name}</dd>
    </div>
  {/if}
  {#if item.type === 'asset'}
    {#if item.image}
      <div>
        <dt>Dimensions:</dt>
        <dd>{item.image.width}x{item.image.height}</dd>
      </div>
    {/if}
    <div>
      <dt>File Type:</dt>
      <dd>{humanFileType(item.mime, item.extension)}</dd>
    </div>
    <div>
      <dt>File Size:</dt>
      <dd>{bytesToHuman(item.bytes)}</dd>
    </div>
  {:else if item.type === 'page' && item.title}
    <div>
      <dt>Title:</dt>
      <dd>{item.title}</dd>
    </div>
  {:else if item.type === 'folder'}
    <div>
      <dt>Path:</dt>
      <dd>{item.path}</dd>
    </div>
    <div>
      <dt>Contents:</dt>
      <dd>{item.childCount} sub-items</dd>
    </div>
  {/if}
  <slot />
</dl>

<style>
  .dialog-chooser-info {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 1em;
    padding: 0;
    margin: 0;
    list-style: none;
  }
  .dialog-chooser-info dt {
    font-weight: bold;
  }
  .dialog-chooser-info dd {
    margin: 0;
  }
  .multiLine .top-row {
    width: 100%;
  }
  .top-row {
    max-width: calc(100% - 9em);
  }
  dl.asset .top-row {
    max-width: 30em;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
</style>
