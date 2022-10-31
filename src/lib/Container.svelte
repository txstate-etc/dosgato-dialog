<script lang="ts">
  import type { Feedback } from '@txstate-mws/svelte-forms'
  import { eq } from '@txstate-mws/svelte-components'
  import InlineMessages from './InlineMessages.svelte'
  import { isNotNull, randomid } from 'txstate-utils'

  export let id: string|undefined = undefined
  export let descid: string|undefined = undefined
  export let label: string
  export let helptext: string|undefined = undefined
  export let messages: Feedback[]
  export let required = false
  let messagesid
  const helptextid = helptext ? randomid() : undefined
</script>

<div use:eq class="dialog-field-container">
  {#if descid == null}
    <label class="dialog-field-label" for={id}>{label}{#if required}&nbsp;*{/if}</label>
  {:else}
    <div id={descid} class="dialog-field-label">{label}{#if required}&nbsp;*{/if}</div>
  {/if}
  <div class="dialog-field-content">
    {#if isNotNull(helptext)}
    <div id={helptextid}>{helptext}</div>
    {/if}
    <slot {messagesid} {helptextid}/>
  </div>
  <InlineMessages bind:id={messagesid} {messages} />
</div>

<style>
  .dialog-field-container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    border-bottom: var(--dialog-container-border, 1px solid #999999);
    padding: var(--dialog-container-padding, 1em) 0;
    --dialog-container-tab-correct: calc(-1 * var(--tabs-panel-padding, 1em));
  }
  .dialog-field-container:last-child {
    border-bottom: 0;
  }
  .dialog-field-container div.dialog-field-content :global(.dialog-field-container) {
    border-bottom: 0;
    background-color: transparent;
    color: inherit;
    padding: 0;
    margin: 0 0 1em 0;
  }
  .dialog-field-container div.dialog-field-content :global(.dialog-field-container:last-child) {
    margin-bottom: 0;
  }
  :global(.tabs-panel) .dialog-field-container {
    margin-left: var(--dialog-container-tab-correct);
    margin-right: var(--dialog-container-tab-correct);
    padding-left: var(--tabs-panel-padding, 1em);
    padding-right: var(--tabs-panel-padding, 1em);
  }
  :global(.tabs-panel) .dialog-field-container:first-child {
    margin-top: var(--dialog-container-tab-correct);
  }
  :global(.tabs-panel) .dialog-field-container:last-child {
    margin-bottom: var(--dialog-container-tab-correct);
  }
  :global(.tabs-panel) .dialog-field-container :global(.dialog-field-container) {
    margin-left: 0;
  }
  .dialog-field-content {
    position: relative;
    width: max(70%, calc(100% - 20em));
  }
  .dialog-field-label {
    width: min(30%, 20em);
  }
  :global([data-eq~="500px"]) .dialog-field-label {
    width: 100%;
    margin-bottom: 0.4em;
  }
  :global([data-eq~="500px"]) .dialog-field-content {
    width: 100%;
  }
  .dialog-field-container :global(.dialog-input) {
    width: 100%;
    padding: 0.4em 0.6em;
  }
  .dialog-field-container:nth-of-type(even) {
    background-color: var(--dialog-field-bg1, #e6e6e6);
    color: var(--dialog-field-text1, inherit);
  }
  .dialog-field-container:nth-of-type(odd) {
    background-color: var(--dialog-field-bg2, #ffffff);
    color: var(--dialog-field-text2, inherit);
  }
  .dialog-field-container :global(.field-help-text) {
    font-size: 0.9em;
    color: #595959;
  }
</style>
