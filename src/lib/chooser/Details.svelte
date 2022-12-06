<script lang="ts">
  import type { AnyItem } from './ChooserAPI'
  import { bytesToHuman, type RawURL } from './ChooserStore'

  export let item: AnyItem|RawURL
</script>

<ul class="dialog-chooser-info" aria-live="polite">
  {#if item.type !== 'raw'}
    <li>{item.path}</li>
  {:else if item.id}
    <li>External Link<br>{item.url}</li>
  {/if}
  {#if item.type === 'asset' && item.image}
    <li>{item.image.width}x{item.image.height}</li>
  {:else if item.type === 'page' && item.title}
    <li>{item.title}</li>
  {:else if item.type === 'folder'}
    <li>{item.path}</li>
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
