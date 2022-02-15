<script lang="ts">
  import type { Feedback } from '@txstate-mws/svelte-forms'
  import InlineMessages from './InlineMessages.svelte'

  export let id: string|undefined = undefined
  export let label: string
  export let messages: Feedback[]
  let messagesid
</script>

<div class="dialog-field-container">
  {#if id != null}
    <label class="dialog-field-label" for={id}>{label}</label>
  {:else}
    <div class="dialog-field-label">{label}</div>
  {/if}
  <div class="dialog-field-content">
    <slot {messagesid} />
  </div>
  <InlineMessages bind:id={messagesid} {messages} />
</div>

<style>
  .dialog-field-container {
    margin-bottom: 10px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }
  .dialog-field-content {
    flex-grow: 1;
  }
  .dialog-field-label {
    width: 30%;
    max-width: 20em;
  }
  :global(.dialog-form[data-eq~="500px"]) .dialog-field-label {
    width: 100%;
    max-width: 100%;
  }
  .dialog-field-container :global(.dialog-input) {
    width: 100%;
    padding: 0.4em 0.6em;
  }
</style>
