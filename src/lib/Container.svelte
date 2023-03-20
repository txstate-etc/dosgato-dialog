<script lang="ts">
  import type { Feedback } from '@txstate-mws/svelte-forms'
  import { eq, ScreenReaderOnly } from '@txstate-mws/svelte-components'
  import { randomid } from 'txstate-utils'
  import { getContext } from 'svelte'
  import { DG_DIALOG_FIELD_MULTIPLE } from './FieldMultiple.svelte'
  import InlineMessages from './InlineMessages.svelte'
  import { getDescribedBy } from '$lib'

  export let id: string|undefined = undefined
  export let descid: string|undefined = undefined
  export let label: string
  export let helptext: string|undefined = undefined
  export let messages: Feedback[]
  export let required = false
  export let related: true | number = 0
  export let conditional: boolean|undefined = undefined
  let messagesid

  const dgMultipleContext = getContext<{ helptextid: string | undefined } | undefined>(DG_DIALOG_FIELD_MULTIPLE)

  const helptextid = randomid()
  $: descids = getDescribedBy([helptext ? helptextid : undefined, dgMultipleContext?.helptextid])
  let showhelp = false
  let helpelement: HTMLDivElement
  $: needsShowHelp = needsShowHelp || (helpelement?.clientWidth < helpelement?.scrollWidth)
</script>

{#if conditional !== false}
<div use:eq class="dialog-field-container" data-related={Array.from({ length: related === true ? 1 : related }, (_, i) => i + 1).join(' ')}>
  {#if descid == null}
    <label class="dialog-field-label" for={id}>{label}{#if required}&nbsp;*{/if}</label>
  {:else}
    <div id={descid} class="dialog-field-label">{label}{#if required}&nbsp;*{/if}</div>
  {/if}
  <div class="dialog-field-content">
    {#if helptext}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div bind:this={helpelement} id={helptextid} class="dialog-field-help" aria-expanded={needsShowHelp ? showhelp : undefined} class:needsShowHelp class:expanded={showhelp} on:click={() => { showhelp = !showhelp }}>
        {helptext}
        {#if needsShowHelp}
          <button type="button" class="dialog-field-help-expand">Show {#if showhelp}Less{:else}More{/if}<ScreenReaderOnly>, ignore this, the help text it controls will be read to you as input description</ScreenReaderOnly></button>
        {/if}
      </div>
    {/if}
    <slot {messagesid} helptextid={descids} />
  </div>
  <InlineMessages bind:id={messagesid} {messages} />
</div>
{/if}

<style>
  .dialog-field-container {
    border-bottom: var(--dialog-container-border, 1px solid #999999);
    padding: var(--dialog-container-padding, 1em) 0;
    --dialog-container-tab-correct: calc(-1 * var(--tabs-panel-padding, 1em));
  }
  .dialog-field-container[data-related~="1"] {
    padding-top: 0;
    padding-left: calc(var(--dialog-container-padding, 1em) + var(--dialog-related-padding, 1em));
  }
  .dialog-field-container[data-related~="2"] {
    padding-left: calc(var(--dialog-container-padding, 1em) + (2 * var(--dialog-related-padding, 1em)));
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
  :global(.tabs-panel) .dialog-field-container[data-related~="1"] {
    padding-left: calc(var(--tabs-panel-padding, 1em) + var(--dialog-container-padding, 1em));
  }
  :global(.tabs-panel) .dialog-field-container[data-related~="2"] {
    padding-left: calc(var(--tabs-panel-padding, 1em) + (2 * var(--dialog-container-padding, 1em)));
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
  .dialog-field-label {
    display: block;
    margin-bottom: 0.3em;
    font-weight: 500;
  }
  .dialog-field-content {
    position: relative;
  }
  .dialog-field-container :global(.dialog-input) {
    width: 100%;
    padding: 0.3em 0.5em;
    border: 0;
    border-radius: 0;
  }
  .dialog-field-container:nth-of-type(even) {
    background-color: var(--dialog-field-bg1, transparent);
    color: var(--dialog-field-text1, inherit);
  }
  .dialog-field-container:nth-of-type(odd) {
    background-color: var(--dialog-field-bg2, transparent);
    color: var(--dialog-field-text2, inherit);
  }
  .dialog-field-help {
    font-size: 0.9em;
    color: #595959;
    margin-bottom: 0.4em;
    line-height: 1.25em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .dialog-field-help.expanded {
    white-space: normal;
    max-height: fit-content;
  }
  .dialog-field-help.needsShowHelp {
    padding-right: 6em;
    cursor: help;
  }
  .dialog-field-help.expanded {
    padding-right: 0;
  }
  .dialog-field-help:not(.expanded) .dialog-field-help-expand {
    position: absolute;
    top: 0;
    right: 0.5em;
  }
  .dialog-field-help-expand {
    background: none!important;
    border: none;
    padding: 0!important;
    color: #069;
    text-decoration: underline;
    cursor: pointer;
  }
  .dialog-field-help-expand:hover {
    text-decoration: none;
  }
</style>
