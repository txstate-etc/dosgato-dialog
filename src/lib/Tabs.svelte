<script lang="ts">
  import { type ElementOffsets, modifierKey, resize, offset, PopupMenu } from '@txstate-mws/svelte-components'
  import { Store } from '@txstate-mws/svelte-store'
  import { getContext, onMount, setContext, tick } from 'svelte'
  import { roundTo } from 'txstate-utils'
  import { DIALOG_TABS_CONTEXT, type DialogTabContext } from './Dialog.svelte'
  import Icon from './Icon.svelte'
  import { TabStore, TAB_CONTEXT, type TabDef } from './TabStore'
  import caretRightFill from '@iconify-icons/ph/caret-right-fill'

  export let tabs: TabDef[]
  export let active: string|undefined = undefined
  export let store = new TabStore(tabs, active)
  export let disableDialogControl = false
  export let accordionOnMobile = true
  $: store.update(v => ({ ...v, tabs, accordionOnMobile }))

  const activeStore = new Store<ElementOffsets>({})
  const tabelements: HTMLElement[] = []
  let tabOverflowButton: HTMLButtonElement
  let activeelement: HTMLElement
  let hiddenTabs: TabDef[] = []
  setContext(TAB_CONTEXT, { store, onClick, onKeyDown, tabelements })

  const dialogContext = (disableDialogControl ? undefined : getContext<DialogTabContext>(DIALOG_TABS_CONTEXT)) ?? { change: () => {} }
  dialogContext.onNext = () => { store.right() }
  dialogContext.onPrev = () => { store.left() }
  $: dialogContext.prevTitle = $store.prevTitle
  $: dialogContext.nextTitle = $store.nextTitle
  $: dialogContext.hasRequired = $store.requireNext
  $: dialogContext.change($store)
  if (!disableDialogControl) setContext(DIALOG_TABS_CONTEXT, { change: () => {} }) // reset context so that any sub-tabs do NOT control the Dialog component

  const currentName = store.currentName()
  const currentIdx = store.currentIdx()
  const accordion = store.accordion()
  $: cols = Math.min(Math.floor(($store.clientWidth ?? 1024) / 90), $store.tabs.length)
  $: scalefactor = Math.min(roundTo(($store.clientWidth ?? 1024) / (cols * 130), 4), 1)
  $: wrapping = cols !== $store.tabs.length
  $: dialogContext.hasTabs = !$accordion

  function onClick (idx: number) {
    return () => store.activate(idx)
  }
  function onKeyDown (idx: number) {
    return async (e) => {
      if (modifierKey(e)) return
      if (['Enter', ' ', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
        e.preventDefault()
        e.stopPropagation()
      }
      if (e.key === 'Enter' || e.key === ' ') {
        store.activate(idx)
      } else if (e.key === 'ArrowLeft' && $store.current > 0) {
        store.left()
        await tick()
        tabelements[$store.current].focus()
      } else if (e.key === 'ArrowRight' && $store.current < $store.tabs.length - 1) {
        store.right()
        await tick()
        tabelements[$store.current].focus()
      } else if (e.key === 'Home' && $store.current > 0) {
        store.home()
        await tick()
        tabelements[$store.current].focus()
      } else if (e.key === 'End' && $store.current < $store.tabs.length - 1) {
        store.end()
        await tick()
        tabelements[$store.current].focus()
      }
    }
  }

  function isActive (idx, activeidx) {
    return idx === (activeidx ?? 0)
  }

  function onOverflowChange (e: any) {
    store.activateName(e.detail.value)
  }

  function tabIsHidden (index: number) {
    if (!wrapping) return false
    const left = Math.max($currentIdx - cols + 1, 0)
    const right = Math.min(left + cols - 1)
    // return (index !== $currentIdx && index >= cols) || (index === cols - 1 && $currentIdx > cols - 1)
    return (index !== $currentIdx) && ((index < left) || (index > right))
  }

  const activeOversize = 2
  async function reactToCurrent (..._: any) {
    if (!activeelement) return
    const tabelement = tabelements[$currentIdx]
    if (!tabelement) return
    const span = tabelement.querySelector(':scope > span') as HTMLSpanElement
    if (!span) return
    const left = span.offsetLeft - activeelement.offsetLeft - activeOversize
    const width = span.offsetWidth + (activeOversize * 2)
    activeelement.style.transform = `translateX(${left}px)`
    activeelement.style.width = `${width}px`
    hiddenTabs = $store.tabs.filter((tab, idx) => { return tabIsHidden(idx) })
  }

  $: active = $currentName
  $: reactToCurrent($activeStore)
  onMount(reactToCurrent)

</script>

{#if $store.tabs.length > 1}
  {#if !$accordion}
    <!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
    <ul use:resize={{ store }} class="tabs-buttons" role="tablist">
      {#each $store.tabs as tab, idx (tab.name)}
        {@const active = isActive(idx, $store.current)}
        {@const left = idx === 0}
        <li bind:this={tabelements[idx]} use:offset={{ store: active ? activeStore : undefined }} id={$store.tabids[tab.name]} class="tabs-tab" class:left class:wrapping class:active class:hidden={tabIsHidden(idx)} style:font-size="{scalefactor}em" style:line-height={1.2 / scalefactor} aria-selected={active} aria-controls={$store.panelids[tab.name]} role="tab" tabindex={active ? 0 : -1} on:click={onClick(idx)} on:keydown={onKeyDown(idx)}><span><Icon icon={tab.icon} inline />{tab.title}</span></li>
      {/each}
      {#if cols < $store.tabs.length}
        <li class="overflow" role="presentation"><button bind:this={tabOverflowButton} type="button" tabindex="-1"><Icon icon={caretRightFill} hiddenLabel="More Tabs Menu" inline /></button></li>
        <PopupMenu buttonelement={tabOverflowButton} items={hiddenTabs.map(t => ({ value: t.name }))} on:change={onOverflowChange}/>
      {/if}
    </ul>
    <div bind:this={activeelement} class="tabs-active"></div>
    <slot current={$store.current} />
  {:else}
    <div use:resize={{ store }} class="tabs-container">
      <slot current={$store.current} />
    </div>
  {/if}
{:else}
  <slot current={$store.current} />
{/if}

<style>
  .tabs-container {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    border-radius: var(--tabs-radius, 0.6em);
    overflow: hidden;
    border: var(--tabs-border, 1px solid #666666);
    margin-bottom: var(--tabs-margin-bottom, 0.8em);
  }
  ul {
    width: 100%;
    padding: 0;
    margin: 0;
    list-style-type: none;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    font-size: 0.9em;
  }
  li, .tabs-container :global(.tabs-tab) {
    padding: var(--tabs-padding-vert, 0.7em) var(--tabs-padding-hori, 1em);
    cursor: pointer;
    word-break: break-word;
    text-transform: uppercase;
    font-weight: 500;
    color: var(--tabs-text, #363534)
  }
  :global(.tabs-tab.hidden) {
    display: none;
  }
  li.overflow {
    min-width: 2em;
    display: flex;
    align-items: center;
    background-color: transparent !important;
    padding: 0;
  }
  li.overflow button {
    background: none;
    cursor: pointer;
    border: 0;
  }
  li:not(.left) {
    margin-left: -1px;
  }

  li:global(.tabs-tab[aria-selected="true"]), .tabs-container :global(.tabs-tab[aria-selected="true"]) {
    font-weight: 700;
  }

  li.active span {
    position: relative;
  }

  li.active span:after {
    content: '';
    position: absolute;
    height: 3px;
    background-color: var(--dg-tabs-active, var(--dg-button-bg, #501214));
    width: 100%;
    left: 0;
    bottom: -3px;
    border-radius: 2px;
  }
</style>
