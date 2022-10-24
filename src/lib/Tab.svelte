<script lang="ts">
  import { getContext } from 'svelte'
  import Icon from './Icon.svelte'
  import { TabStore, TAB_CONTEXT } from './TabStore'

  export let title: string

  const { store, onClick, onKeyDown, tabelements } = getContext<{ store: TabStore, onClick: Function, onKeyDown: Function, tabelements: HTMLElement[] }>(TAB_CONTEXT)
  const accordion = store.accordion()
  const current = store.currentTitle()
  $: active = $current === title
  const idx = $store.tabs.findIndex(t => t.title === title)
  const last = idx === $store.tabs.length - 1
</script>

{#if $accordion}
  <div bind:this={tabelements[idx]} id={$store.tabids[title]} class="tabs-tab" class:last aria-selected={active} aria-controls={$store.panelids[title]} role="tab" tabindex={0} on:click={onClick(idx)} on:keydown={onKeyDown(idx)}><Icon icon={$store.tabs[idx].icon} inline />{title}<i class="tabs-accordion-arrow" aria-hidden="true"></i></div>
{/if}
<div id={$store.panelids[title]} hidden={!active} role="tabpanel" tabindex="-1" aria-labelledby={$store.tabids[title]} class="tabs-panel" class:accordion={$accordion}>
  <slot />
</div>

<style>
  .tabs-panel {
    width: 100%;
    border: var(--tabs-panel-border, var(--tabs-border, 1px solid #666666));
    padding: var(--tabs-panel-padding, 1em);
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
