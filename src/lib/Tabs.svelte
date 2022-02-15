<script lang="ts">
  import { modifierKey, resize } from '@txstate-mws/svelte-components'
  import { setContext, tick } from 'svelte'
  import { roundTo } from 'txstate-utils'
  import { TabStore, TAB_CONTEXT } from './TabStore'

  export let active: string|undefined = undefined
  export let initialTabs: string[] = []
  export let store = new TabStore(active, initialTabs)

  setContext(TAB_CONTEXT, store)
  const tabelements: HTMLElement[] = []
  const current = store.currentTitle()
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
      } else if (e.key === 'ArrowLeft' && idx > 0) {
        store.left()
        await tick()
        tabelements[idx - 1].focus()
      } else if (e.key === 'ArrowRight' && idx < $store.tabs.length - 1) {
        store.right()
        await tick()
        tabelements[idx + 1].focus()
      } else if (e.key === 'Home' && idx > 0) {
        store.home()
        await tick()
        tabelements[0].focus()
      } else if (e.key === 'End' && idx < $store.tabs.length - 1) {
        store.end()
        await tick()
        tabelements[$store.tabs.length - 1].focus()
      }
    }
  }

  function isActive (idx, activeidx) {
    return idx === (activeidx ?? 0)
  }

  $: active = $current
</script>

<ul use:resize={{ store }} class="dialog-tab-buttons" role="tablist">
  {#each $store.tabs as name, idx (name)}
    {@const active = isActive(idx, $store.current)}
    {@const left = idx % cols === 0}
    <li bind:this={tabelements[idx]} id={$store.tabids[name]} class:left class:wrapping class:active style:font-size="{scalefactor}em" style:line-height={1.2 / scalefactor} style:width={left ? widthleft : width} aria-selected={active} aria-controls={$store.panelids[name]} role="tab" tabindex={active ? 0 : -1} on:click={onClick(idx)} on:keydown={onKeyDown(idx)}>{name}</li>
  {/each}
</ul>
<slot current={$store.current} />

<style>
  ul {
    padding: 0;
    margin: 0;
    list-style-type: none;
    display: flex;
    flex-wrap: wrap;
  }
  li {
    padding: var(--tabs-padding, 0.5em 1em);
    border: var(--tabs-border, 1px solid #666666);
    border-top-left-radius: var(--tabs-radius, 0.6em);
    border-top-right-radius: var(--tabs-radius, 0.6em);
    cursor: pointer;
    word-break: break-word;
  }
  li:not(.left) {
    margin-left: -1px;
  }
  li.active {
    color: var(--tabs-active-text, #ffffff);
    background-color: var(--tabs-active-bg, #333333);
  }
</style>
