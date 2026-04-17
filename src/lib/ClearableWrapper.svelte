<script lang="ts">
  import xCircle from '@iconify-icons/ph/x-circle'
  import Icon from './Icon.svelte'

  export let clearable = false
  export let hasValue = false
  export let hiddenLabel = 'clear'
  export let fieldid: string | undefined = undefined

  $: labelid = fieldid ? `${fieldid}-label` : undefined
</script>

{#if clearable}
  <div class="dialog-clearable-wrapper" class:has-value={hasValue}>
    <slot />
    {#if hasValue}
      <button type="button" class="dialog-clearable-btn" aria-describedby={labelid} on:click><Icon icon={xCircle} hiddenLabel={hiddenLabel} inline/></button>
    {/if}
  </div>
{:else}
  <slot />
{/if}

<style>
  .dialog-clearable-wrapper {
    display: flex;
    align-items: center;
  }
  .dialog-clearable-wrapper :global(.dialog-input) {
    flex: 1;
  }
  .dialog-clearable-btn {
    display: flex;
    align-items: center;
    background: none;
    border: none;
    padding: 0.3em;
    cursor: pointer;
    color: #666;
  }
  .dialog-clearable-btn:hover {
    color: #333;
  }
</style>
