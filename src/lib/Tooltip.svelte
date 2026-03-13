<script lang="ts">
  import { tick } from 'svelte'
  import { glue, ScreenReaderOnly, type GlueAlignOpts } from '@txstate-mws/svelte-components'
  import { randomid } from 'txstate-utils'

  export let tip: string | undefined = undefined
  export let top: boolean = false
  export let right: boolean = false
  export let bottom: boolean = false
  export let left: boolean = false
  export let align: GlueAlignOpts | undefined = undefined
  export let active: boolean = false

  const tooltipId = randomid()
  const anchorName = `--tip-${tooltipId}`
  let slotwrapper: HTMLSpanElement

  let hasFocusableChild = false
  $: resolvedAlign = align ?? (top ? 'top' : right ? 'right' : bottom ? 'bottom' : left ? 'left' : 'auto') as GlueAlignOpts

  async function reactToTip (..._: any[]) {
    await tick()
    if (!slotwrapper) return
    const focusable = slotwrapper.querySelector('a[href], button, input, select, textarea, [tabindex]')
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
  <span bind:this={slotwrapper} class="tooltip-slot">
    <slot />
    {#if !hasFocusableChild}<ScreenReaderOnly>tooltip: {tip}</ScreenReaderOnly>{/if}
  </span>
  <div
    id={tooltipId}
    role="tooltip"
    class="tooltip"
    class:active
    use:glue={{ target: slotwrapper, align: resolvedAlign, gap: 5 }}>
      <div class="default-tip tip">{tip}</div>
  </div>
</div>
{:else}
  <slot />
{/if}

<style>
  .tooltip {
    opacity: 0;
    z-index: 1;
    visibility: hidden;
    white-space: pre-line;
    transition: opacity 150ms, visibility 150ms;
  }
  .default-tip {
    padding: 4px 8px;
    border-radius: 6px;
    color: inherit;
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
