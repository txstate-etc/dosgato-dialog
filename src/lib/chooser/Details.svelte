<script lang="ts">
  import { bytesToHuman, combinePath, type AnyUIItem, type RawURL } from './ChooserStore'

  export let item: AnyUIItem|RawURL
</script>

<ul class="dialog-chooser-info">
  {#if item.type !== 'raw'}
    <li>{item.name}</li>
  {/if}
  {#if item.type === 'asset' && item.image}
    <li>{item.image.width}x{item.image.height}</li>
  {:else if item.type === 'page'}
    <li>{item.title}</li>
  {:else if item.type === 'folder'}
    <li>{combinePath(item.path, item.name)}</li>
  {/if}
  {#if item.type === 'asset'}
    <li>{item.mime}</li>
    <li>{bytesToHuman(item.bytes)}</li>
  {/if}
  <slot />
</ul>

<style>
  .dialog-chooser-info {
    padding: 0;
    margin: 0;
    list-style: none;
  }
</style>