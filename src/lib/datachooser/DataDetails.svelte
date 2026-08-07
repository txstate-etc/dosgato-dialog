<script lang="ts">
  import type { DataChooserItem, UnknownDataItem } from './DataChooserAPI'

  export let item: DataChooserItem | UnknownDataItem
  export let singleLine = false

  const statusLabels = { published: 'Published', modified: 'Has unpublished changes', unpublished: 'Unpublished' }
</script>

<dl class="dialog-chooser-info" aria-live="polite" class:multiLine={!singleLine}>
  {#if 'broken' in item}
    <div class="top-row">
      <dt>Unknown Item (may have been deleted):</dt>
      <dd>{item.id}</dd>
    </div>
  {:else}
    <div class="top-row name">
      <dt>Name:</dt>
      <dd>{item.label ?? item.name}</dd>
    </div>
    <div>
      <dt>Path:</dt>
      <dd>{item.path}</dd>
    </div>
    {#if item.hasChildren && item.childCount != null}
      <div>
        <dt>Contents:</dt>
        <dd>{item.childCount} sub-items</dd>
      </div>
    {/if}
    {#if item.published}
      <div>
        <dt>Status:</dt>
        <dd>{statusLabels[item.published]}</dd>
      </div>
    {/if}
    {#each item.details ?? [] as detail (detail.label)}
      <div>
        <dt>{detail.label}:</dt>
        <dd>{detail.value}</dd>
      </div>
    {/each}
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
</style>
