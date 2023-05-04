<script lang="ts">
  import { derivedStore } from '@txstate-mws/svelte-store'
  import { getContext } from 'svelte'
  import Icon from './Icon.svelte'
  import { TabStore, TAB_CONTEXT } from './TabStore'

  export let name: string

  const { store, onClick, onKeyDown, tabelements } = getContext<{ store: TabStore, onClick: Function, onKeyDown: Function, tabelements: HTMLElement[] }>(TAB_CONTEXT)
  const accordion = store.accordion()
  const current = store.currentName()
  const def = derivedStore(store, v => v.tabs.find(t => t.name === name))
  const title = derivedStore(def, 'title')
  const tabid = derivedStore(store, v => v.tabids[name])
  const panelid = derivedStore(store, v => v.panelids[name])
  $: active = $current === name
  const idx = $store.tabs.findIndex(t => t.name === name)
  const last = idx === $store.tabs.length - 1
</script>

{#if $store.tabs.length > 1}
  {#if $accordion}
    <div bind:this={tabelements[idx]} id={$tabid} class="tabs-tab" class:last aria-selected={active} aria-controls={$panelid} role="tab" tabindex={0} on:click={onClick(idx)} on:keydown={onKeyDown(idx)}><Icon icon={$store.tabs[idx].icon} inline />{$title}<i class="tabs-accordion-arrow" aria-hidden="true"></i></div>
  {/if}
  <div id={$panelid} hidden={!active} role="tabpanel" tabindex="-1" aria-labelledby={$tabid} class="tabs-panel" class:accordion={$accordion}>
    <slot />
  </div>
{:else}
  <slot />
{/if}

<style>
  .tabs-panel {
    width: 100%;
    min-height: 50vh;
    border: var(--tabs-panel-border, var(--tabs-border, 0));
    padding: var(--tabs-margin-top, 2em) var(--tabs-padding-hori, 0.7em) 0.5em var(--tabs-padding-hori, 0.7em);
  }
  .tabs-panel.accordion {
    border-left: 0;
    border-right: 0;
  }
  .tabs-panel:not(.accordion) {
    border-bottom-left-radius: var(--tabs-panel-radius, var(--tabs-radius, 0.3em));
    border-bottom-right-radius: var(--tabs-panel-radius, var(--tabs-radius, 0.3em));
    overflow: hidden;
    margin-bottom: var(--tabs-margin-bottom, 0.8em);
    margin-top: -1px;
  }
  .tabs-tab {
    position: relative;
    width: 100%;
  }
  .tabs-tab:not(.last) {
    border-bottom: var(--tabs-border, 1px solid #666666);
  }
  i.tabs-accordion-arrow {
    transform: translateY(-50%) rotate(45deg);
    border: solid currentColor;
    border-width: 0 .2em .2em 0;
    padding: .15em;
    position: absolute;
    right: 0.6em;
    top: calc(50% - 0.08em);
  }
  .tabs-tab[aria-selected="true"] i.tabs-accordion-arrow {
    transform: translateY(-50%) rotate(225deg);
    top: calc(50% + 0.08em);
  }
</style>
