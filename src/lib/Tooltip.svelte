<script lang="ts">
  export let tip: string | undefined = undefined
  export let top: boolean = false
  export let right: boolean = false
  export let bottom: boolean = false
  export let left: boolean = false
  export let active: boolean = false
</script>

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
  .tooltip-slot:hover + .tooltip {
    opacity: 1;
    visibility: initial;
  }
  .tip {
    border: 1px solid #000;
    background-color: #fff;
  }
</style>

{#if tip}
<div class="tooltip-wrapper">
  <span class="tooltip-slot">
    <slot />
  </span>
  <div
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
