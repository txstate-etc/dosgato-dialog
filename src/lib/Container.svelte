<!-- @component
  The purpose of `<Container>` is to provide common rendering for helptext, screen reader support,
  and `Feedback` messages for its slotted components under a common `<div>` useful for form fields.
-->
<script lang="ts">
  import type { Feedback } from '@txstate-mws/svelte-forms'
  import { eq, resize, ScreenReaderOnly } from '@txstate-mws/svelte-components'
  import { randomid } from 'txstate-utils'
  import { getContext } from 'svelte'
  import { DG_DIALOG_FIELD_MULTIPLE } from './FieldMultiple.svelte'
  import InlineMessages from './InlineMessages.svelte'
  import { getDescribedBy } from '$lib'

  /** A label for the Container `<div>`. */
  export let label: string
  export let messages: Feedback[]
  /** If the input that's being built has an id pass it here so the label can point at it. */
  export let id: string|undefined = undefined
  /** If `descid` is defined then this assumes you've made an outside label referenced to by descid `<div id={descid}`.
  Useful for things like checkboxes and radio buttons that have their own individual labels. */
  export let descid: string|undefined = undefined
  export let helptext: string|undefined = undefined
  /** Syntactic sugar that toggles a '*' to be appended to label. */
  export let required = false
  export let related: true | number = 0
  export let conditional: boolean|undefined = undefined
  /** The `id` of `<div>` messages are rendered in. */
  let messagesid

  const dgMultipleContext = getContext<{ helptextid: string | undefined } | undefined>(DG_DIALOG_FIELD_MULTIPLE)

  const helptextid = randomid()
  $: descids = getDescribedBy([helptext ? helptextid : undefined, dgMultipleContext?.helptextid])
  let showhelp = false
  let helpelement: HTMLSpanElement
  let needsShowHelp = false
  function setNeedsShowHelp (..._: any[]) {
    needsShowHelp = (helpelement?.getClientRects().length ?? 0) > 1
    if (!needsShowHelp) showhelp = false
  }
  $: setNeedsShowHelp(helpelement)
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
      <div use:resize={{ debounce: 10 }} on:resize={setNeedsShowHelp} id={helptextid} class="dialog-field-help" class:needsShowHelp class:expanded={showhelp} on:click={() => { if (needsShowHelp) showhelp = !showhelp }}>
        <span bind:this={helpelement}>{@html helptext}</span>
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
    height: 1.25em;
  }
  .dialog-field-help.expanded {
    max-height: fit-content;
    height: auto;
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
