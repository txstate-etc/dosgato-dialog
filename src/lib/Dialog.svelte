<script context="module" lang="ts">
  export const DIALOG_TABS_CONTEXT = {}
  export interface DialogTabContext {
    change: (..._: any) => void
    hasTabs?: boolean
    prevTitle?: string,
    nextTitle?: string,
    hasRequired?: boolean,
    onNext?: () => void
    onPrev?: () => void
  }
</script>
<script lang="ts">
  import arrowLeftLight from '@iconify-icons/ph/arrow-left-light'
  import arrowRightLight from '@iconify-icons/ph/arrow-right-light'
  import xLight from '@iconify-icons/ph/x-light'
  import { Modal, ScreenReaderOnly } from '@txstate-mws/svelte-components'
  import { createEventDispatcher, setContext } from 'svelte'
  import { isNotBlank, randomid } from 'txstate-utils'
  import { Button, Icon } from '$lib'
  import type { IconifyIcon } from '@iconify/svelte'
  const dispatch = createEventDispatcher()

  export let initialfocus: string|undefined = undefined
  export let title = ''
  export let icon: IconifyIcon = undefined
  export let size: 'tiny'|'small'|'normal'|'large'|'xl' = 'normal'
  export let cancelText: string|undefined = undefined
  export let continueText: string = 'Ok'
  export let continueIcon: IconifyIcon = undefined
  export let escapable = isNotBlank(cancelText)
  export let disabled = false
  export let ignoreTabs = false

  export let labelid = randomid()
  export let descid = randomid()


  const ctx: DialogTabContext = { change: onTabChange }
  let hasTabs = false
  let prevTitle: string | undefined
  let nextTitle: string | undefined
  let hasRequired = false
  let onPrev: () => void
  let onNext: () => void
  function onTabChange () {
    ({ hasTabs, prevTitle, nextTitle, hasRequired, onPrev, onNext } = ctx)
  }
  setContext(DIALOG_TABS_CONTEXT, ctx)

  $: describedby = [title ? labelid : undefined, descid].filter(isNotBlank).join(' ')
</script>

<Modal {escapable} {initialfocus} hidefocus={false} on:escape>
  <section class="{size}">
    {#if title || icon}
      <header id={labelid}>
        <Icon width="1.4em" {icon} inline />{title}
      </header>
    {/if}
    {#if escapable}
      <button type="button" class="escape" on:click={() => dispatch('escape')}><Icon icon={xLight} width="2em" hiddenLabel="Close Dialog" /></button>
    {/if}
    <div id={descid} class="content">
      <slot></slot>
    </div>
    <footer class="actions">
      <slot name="buttons" {nextTitle} {prevTitle} hasRequired={hasRequired && !ignoreTabs} onPrev={onPrev} onNext={onNext}>
        {#if prevTitle && !ignoreTabs}
          <Button class="prev" disabled={!prevTitle} on:click={onPrev}><Icon icon={arrowLeftLight} inline /> Previous<ScreenReaderOnly> Tab ({prevTitle})</ScreenReaderOnly></Button>
        {/if}
        {#if isNotBlank(cancelText)}
          <Button cancel {describedby} on:click={() => dispatch('escape')}>{cancelText}</Button>
        {/if}
        <Button class="primary" disabled={disabled || (hasRequired && !ignoreTabs)} {describedby} on:click={() => dispatch('continue')}><Icon icon={continueIcon} inline />{continueText}</Button>
        {#if nextTitle && !ignoreTabs}
          <Button class="next" disabled={!nextTitle} on:click={onNext}>Next<ScreenReaderOnly> Tab ({nextTitle})</ScreenReaderOnly> <Icon width="1.2em" icon={arrowRightLight} inline /></Button>
        {/if}
      </slot>
    </footer>
  </section>
</Modal>

<style>
  section {
    position: relative;
    background-color: #f4f4f4;
    padding: 1em;
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
    max-width: 650px;
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

  header {
    display: flex;
    align-items: center;
    font-size: 1.1em;
    margin: -1em;
    margin-bottom: 0;
    padding: 0.5em calc(var(--tabs-padding-hori, 1em) + 0.9em - 3px);
    background-color: var(--dg-dialog-header-bg, #DDDDDD);
    color: var(--dg-dialog-header-text, black);
  }

  header :global(svg) {
    margin-right: 0.4em;
  }

  .content {
    margin: 0 -1em;
    padding: 1em;
    min-height: 5em;
    overflow: auto;
    background-color: var(--dg-dialog-content-bg, #f4f4f4);
    max-height: calc(100vh - 7em);
  }

  footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    background-color: var(--dg-dialog-footer-bg, #DDDDDD);
    margin: -1em;
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

  footer.actions :global(.prev) {
    margin-right: auto;
  }

  .escape {
    position: absolute;
    top: 0.1em;
    right: 0;
    border: 0;
    background: none;
    cursor: pointer;
  }
</style>