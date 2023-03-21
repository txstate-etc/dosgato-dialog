<script lang="ts">
  import { bytesToHuman, type AnyUIItem, type RawURL } from './ChooserStore'

  export let item: AnyUIItem|RawURL
</script>

<dl class="dialog-chooser-info" aria-live="polite">
  {#if item.type !== 'raw'}
    <div class="top-row">
      <dt>Name:</dt>
      <dd>{item.path}</dd>
    </div>
  {:else if item.id}
    <div>
      <dt>External Link:</dt>
      <dd>{item.url}</dd>
    </div>
  {/if}
  {#if item.type === 'asset'}
    <div class="horizontal-group">
      {#if item.image}
        <div>
          <dt>Dimensions:</dt>
          <dd>{item.image.width}x{item.image.height}</dd>
        </div>
      {/if}
      <div>
        <dt>File Type:</dt>
        <dd>{item.mime}</dd>
      </div>
      <div>
        <dt>File Size:</dt>
        <dd>{bytesToHuman(item.bytes)}</dd>
      </div>
    </div>
  {:else if item.type === 'page' && item.title}
    <dt>Title:</dt>
    <dd>{item.title}</dd>
  {:else if item.type === 'folder'}
    <div class="horizontal-group">
      <div>
        <dt>Path:</dt>
        <dd>{item.path}</dd>
      </div>
      <div>
        <dt>Contents:</dt>
        <dd>{item.children?.length ?? 0} sub-items</dd>
      </div>
    </div>
  {/if}
  <slot />
</dl>

<style>
  .dialog-chooser-info {
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
  .top-row {
    margin-bottom: 1em;
  }
  .horizontal-group {
    display: flex;
    justify-content: space-between;
  }
  :global([data-eq~="1400px"]) .horizontal-group {
    flex-direction: column;
  }
  :global([data-eq~="1400px"]) .horizontal-group div:not(:last-child){
    margin-bottom: 1em;
  }
</style>
