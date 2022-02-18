<script lang="ts">
  import { getContext, onDestroy } from 'svelte'
  import { TabStore, TAB_CONTEXT } from './TabStore'

  export let title: string

  const store = getContext<TabStore>(TAB_CONTEXT)
  store.registerTab(title)
  const current = store.currentTitle()
  $: active = $current === title

  onDestroy(() => store.unregisterTab(title))
</script>

<div id={$store.panelids[title]} class:active role="tabpanel" tabindex="0" aria-labelledby={$store.tabids[title]} class="tabs-panel">
  <slot />
</div>

<style>
  div {
    display: none;
    border: var(--tabs-panel-border, var(--tabs-border, 1px solid #666666));
    padding: var(--tabs-panel-padding, 1em);
    border-bottom-left-radius: var(--tabs-panel-radius, var(--tabs-radius, 0.3em));
    border-bottom-right-radius: var(--tabs-panel-radius, var(--tabs-radius, 0.3em));
    margin-top: -1px;
    overflow: hidden;
  }
  div.active {
    display: block;
  }
</style>
