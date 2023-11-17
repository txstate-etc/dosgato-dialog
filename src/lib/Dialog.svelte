<script context="module" lang="ts">
  export const DIALOG_TABS_CONTEXT = {}
  export interface DialogTabContext {
    change: (..._: any) => void
    hasTabs?: boolean
    prevTitle?: string
    nextTitle?: string
    hasRequired?: boolean
    onNext?: () => void
    onPrev?: () => void
  }
</script>
<script lang="ts">
  import type { IconifyIcon } from '@iconify/svelte'
  import arrowLeft from '@iconify-icons/ph/arrow-left-bold'
  import arrowRight from '@iconify-icons/ph/arrow-right-bold'
  import xLight from '@iconify-icons/ph/x-light'
  import arrowsOutSimple from '@iconify-icons/ph/arrows-out-simple'
  import arrowsInSimple from '@iconify-icons/ph/arrows-in-simple'
  import { eq, Modal, ScreenReaderOnly } from '@txstate-mws/svelte-components'
  import { createEventDispatcher, setContext } from 'svelte'
  import { isNotBlank, randomid } from 'txstate-utils'
  import { Button, Icon } from '$lib'
  const dispatch = createEventDispatcher()

  export let initialfocus: string | undefined = undefined
  export let title = ''
  export let icon: IconifyIcon | undefined = undefined
  export let size: 'tiny' | 'small' | 'normal' | 'large' | 'xl' = 'normal'
  export let cancelText: string | undefined = undefined
  export let continueText: string = 'Ok'
  export let continueIcon: IconifyIcon | undefined = undefined
  export let escapable = isNotBlank(cancelText)
  export let expandable: boolean = false
  export let disabled = false
  export let ignoreTabs = false

  export let labelid = randomid()
  export let descid = randomid()

  const ctx: DialogTabContext = { change: onTabChange }
  let hasTabs: boolean | undefined = false
  let prevTitle: string | undefined
  let nextTitle: string | undefined
  let hasRequired: boolean | undefined = false
  let onPrev: (() => void) | undefined
  let onNext: (() => void) | undefined
  let expanded: boolean = false
  function onTabChange () {
    ({ hasTabs, prevTitle, nextTitle, hasRequired, onPrev, onNext } = ctx)
  }
  setContext(DIALOG_TABS_CONTEXT, ctx)

  $: describedby = [title ? labelid : undefined, descid].filter(isNotBlank).join(' ')
</script>

<Modal {escapable} {initialfocus} hidefocus={false} includeselector=".ck-body-wrapper" on:escape>
  <section class="{expanded ? 'xl' : size}" use:eq>
    {#if title || icon}
      <header id={labelid}>
        <Icon width="1.4em" {icon} inline />{title}
      </header>
    {/if}
    <div class="header-buttons">
      {#if expandable && size !== 'xl'}
        <button type="button" class="expand" on:click={() => { expanded = !expanded } }><Icon icon={expanded ? arrowsInSimple : arrowsOutSimple} width="2em" hiddenLabel={`${expanded ? 'Contract' : 'Expand'} dialog`}/></button>
      {/if}
      {#if escapable}
        <button type="button" class="escape" on:click={() => dispatch('escape')}><Icon icon={xLight} width="2em" hiddenLabel="Close Dialog" /></button>
      {/if}
    </div>
    <div id={descid} class="dialog-content">
      <slot></slot>
    </div>
    <footer class="actions">
      <slot name="buttons" {nextTitle} {prevTitle} hasRequired={hasRequired && !ignoreTabs} onPrev={onPrev} onNext={onNext} {describedby}>
        {#if prevTitle && !ignoreTabs}
          <Button class="prev" disabled={!prevTitle} on:click={onPrev}><Icon icon={arrowLeft} inline /> <span class="prev-next" aria-hidden="true">Previous</span><ScreenReaderOnly>Previous Tab ({prevTitle})</ScreenReaderOnly></Button>
        {/if}
        {#if isNotBlank(cancelText)}
          <Button cancel {describedby} on:click={() => dispatch('escape')}>{cancelText}</Button>
        {/if}
        {#if isNotBlank(continueText)}
          <Button class="primary" disabled={disabled || (hasRequired && !ignoreTabs)} {describedby} on:click={() => dispatch('continue')}><Icon icon={continueIcon} inline /> {continueText}</Button>
        {/if}
        {#if nextTitle && !ignoreTabs}
          <Button class="next" disabled={!nextTitle} on:click={onNext}><span class="prev-next" aria-hidden="true">Next</span><ScreenReaderOnly> Next Tab ({nextTitle})</ScreenReaderOnly> <Icon icon={arrowRight} inline /></Button>
        {/if}
      </slot>
    </footer>
  </section>
</Modal>

<style>
  section {
    position: relative;
    background-color: #f4f4f4;
    overflow: hidden;
  }
  section.tiny {
    width: 30vw;
    min-width: 200px;
    max-width: 250px;
  }
  section.small {
    width: 50vw;
    min-width: 220px;
    max-width: 400px;
  }
  section.normal {
    width: 75vw;
    min-width: 250px;
    max-width: 750px;
  }
  section.large {
    width: 90vw;
    min-width: 300px;
    max-width: 1000px;
  }
  section.xl {
    width: 95vw;
    max-width: 2000px;
  }

  section {
    container-type: inline-size;
    container-name: dosgato-dialog-section
  }

  @media (max-width: 430px) {
    section.tiny, section.small, section.normal, section.large, section.xl {
      width: 95vw;
      max-width: 2000px;
    }
    button.expand {
      display: none;
    }
  }

  header {
    display: flex;
    align-items: center;
    font-size: 1.1em;
    margin-bottom: 0;
    padding: 0.5em calc(var(--tabs-padding-hori, 1em) + 0.9em - 3px);
    background-color: var(--dg-dialog-header-bg, #DDDDDD);
    color: var(--dg-dialog-header-text, black);
  }

  header :global(svg) {
    margin-right: 0.4em;
  }

  .header-buttons button {
    color: black;
  }

  .dialog-content {
    position: relative;
    padding: 2em;
    min-height: 5em;
    overflow: auto;
    background-color: var(--dg-dialog-content-bg, #f4f4f4);
    max-height: calc(100vh - 7.5em);
    max-height: calc(100dvh - 7.5em);
  }

  section.tiny .dialog-content, section.small .dialog-content {
    padding: 0 1em;
  }

  footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    background-color: var(--dg-dialog-footer-bg, #DDDDDD);
    margin-top: 0;
    padding: 0.5em 1em;
  }

  footer > :global(*:not(:last-child)) {
    margin-right: 0.5em;
  }

  :global(.dialog-field-container) {
    background-color: transparent !important;
    border-bottom: 0px !important;
  }

  footer.actions {
    container-type: inline-size;
    container-name: dosgato-dialog-actions
  }

  footer.actions :global(.prev) {
    margin-right: auto;
  }

  @container dosgato-dialog-actions (max-width: 450px) {
    footer.actions :global(button span.prev-next) {
      display: none;
    }
  }

  @container dosgato-dialog-section (max-width: 350px) {
    footer.actions {
      padding: 0.5em;
    }
  }

  .header-buttons {
    position: absolute;
    top: 0.1em;
    right: 0;
  }
  .header-buttons button {
    border: 0;
    background: none;
    cursor: pointer;
  }
</style>
