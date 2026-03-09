<script lang="ts">
  import { tick } from 'svelte'
  import { ScreenReaderOnly } from '@txstate-mws/svelte-components'
  import { randomid } from 'txstate-utils'

  export let tip: string | undefined = undefined
  export let top: boolean = false
  export let right: boolean = false
  export let bottom: boolean = false
  export let left: boolean = false
  export let active: boolean = false

  const tooltipId = randomid()
  let triggerEl: HTMLSpanElement
  let hasFocusableChild = false

  async function reactToTip (..._: any[]) {
    await tick()
    if (!triggerEl) return
    const focusable = triggerEl.querySelector('a[href], button, input, select, textarea, [tabindex]')
    if (focusable) {
      hasFocusableChild = true
      focusable.setAttribute('aria-describedby', tooltipId)
    } else {
      hasFocusableChild = false
    }
  }
  $: reactToTip(tip).catch(console.error)
</script>

{#if tip}
<div class="tooltip-wrapper">
  <span class="tooltip-slot" bind:this={triggerEl}>
    <slot />
    {#if !hasFocusableChild}<ScreenReaderOnly>tooltip: {tip}</ScreenReaderOnly>{/if}
  </span>
  <div
    id={tooltipId}
    role="tooltip"
    class="tooltip"
    class:active
    class:left
    class:right
    class:bottom
    class:top>
      <div class="default-tip tip">{tip}</div>
  </div>
</div>
{:else}
  <slot />
{/if}

<style>
  .tooltip {
    opacity: 0;
    position: absolute;
    z-index: 1;
    visibility: hidden;
    transition: opacity 150ms, visibility 150ms;
  }
  .default-tip {
    padding: 4px 8px;
    border-radius: 6px;
    color: inherit;
  }
  .tooltip.top {
    transform: translate(-40%, -100%);
    margin-top: -20px;
  }
  .tooltip.active {
    opacity: 1;
    visibility: initial;
  }
  .tooltip-slot:hover + .tooltip,
  .tooltip-slot:focus-within + .tooltip {
    opacity: 1;
    visibility: initial;
  }
  .tip {
    border: 1px solid #000;
    background-color: #fff;
  }
</style>
