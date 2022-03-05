<script lang="ts">
  import { modifierKey, resize } from '@txstate-mws/svelte-components'
  import { setContext } from 'svelte'
  import { roundTo } from 'txstate-utils'
  import Icon from './Icon.svelte'
  import { TabStore, TAB_CONTEXT } from './TabStore'

  export let tabs: { title: string }[]
  export let active: string|undefined = undefined
  export let store = new TabStore(tabs, active)

  const tabelements: HTMLElement[] = []
  setContext(TAB_CONTEXT, { store, onClick, onKeyDown, tabelements })
  const current = store.currentTitle()
  const accordion = store.accordion()
  $: cols = Math.min(Math.floor($store.clientWidth / 90), $store.tabs.length)
  $: scalefactor = Math.min(roundTo($store.clientWidth / (cols * 130), 4), 1)
  $: width = `calc(${100 / cols}% + 1px)`
  $: widthleft = `${100 / cols}%`
  $: wrapping = cols !== $store.tabs.length

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
        tabelements[$store.current].focus()
      } else if (e.key === 'ArrowRight' && $store.current < $store.tabs.length - 1) {
        store.right()
        tabelements[$store.current].focus()
      } else if (e.key === 'Home' && $store.current > 0) {
        store.home()
        tabelements[$store.current].focus()
      } else if (e.key === 'End' && $store.current < $store.tabs.length - 1) {
        store.end()
        tabelements[$store.current].focus()
      }
    }
  }

  function isActive (idx, activeidx) {
    return idx === (activeidx ?? 0)
  }

  $: active = $current
</script>

{#if !$accordion}
  <ul use:resize={{ store }} class="dialog-tab-buttons" role="tablist">
    {#each $store.tabs as tab, idx (tab.title)}
    {@const active = isActive(idx, $store.current)}
    {@const left = idx % cols === 0}
    <li bind:this={tabelements[idx]} id={$store.tabids[tab.title]} class="tabs-tab" class:left class:wrapping class:active style:font-size="{scalefactor}em" style:line-height={1.2 / scalefactor} style:width={left ? widthleft : width} aria-selected={active} aria-controls={$store.panelids[tab.title]} role="tab" tabindex={active ? 0 : -1} on:click={onClick(idx)} on:keydown={onKeyDown(idx)}><Icon icon={tab.icon} inline />{tab.title}</li>
    {/each}
  </ul>
  <slot current={$store.current} />
{:else}
  <div use:resize={{ store }} class="tabs-container">
    <slot current={$store.current} />
  </div>
{/if}

<style>
  .tabs-container {
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
  }
  li, .tabs-container :global(.tabs-tab) {
    padding: var(--tabs-padding, 0.7em 1em);
    cursor: pointer;
    word-break: break-word;
  }
  li {
    border: var(--tabs-border, 1px solid #666666);
    border-top-left-radius: var(--tabs-radius, 0.6em);
    border-top-right-radius: var(--tabs-radius, 0.6em);
  }
  li:not(.left) {
    margin-left: -1px;
  }
  li:global(.tabs-tab[aria-selected="true"]), .tabs-container :global(.tabs-tab[aria-selected="true"]) {
    color: var(--tabs-active-text, #ffffff);
    background-color: var(--tabs-active-bg, #333333);
  }
</style>
