<!-- @component
  This is a wrapper component around iconify's [OfflineIcon](https://docs.iconify.design/icon-components/svelte/offline.html)
  implementation of icons that adds a hidden label that can be read by screen readers. Useful for situations where aria-label
  isn't supported, to provide in kind icon support, while still making use of aria attributes regardless of support.
-->
<script lang="ts">
  import type { IconifyIcon } from '@iconify/svelte'
  import Tooltip from './Tooltip.svelte'
  export let icon: IconifyIcon | undefined
  /** Label used in a `<ScreenReaderOnly>`. */
  export let hiddenLabel: string | undefined = undefined
  export let inline: boolean = false
  export let width: string | number | undefined = undefined
  export let height: string | number | undefined = undefined
  export let tooltip: string | undefined = undefined

  // If neither is defined, set both to 1em
  if (!width && !height) width = height = '1em'
  height ??= width
</script>

{#if icon}
  <Tooltip tip={tooltip} top>
    <svg role="img" viewBox="{icon.left ?? 0} {icon.top ?? 0} {icon.width ?? 256} {icon.height ?? 256}" class:vFlip={icon.vFlip} class:hFlip={icon.hFlip} class:inline {width} {height} aria-hidden={!hiddenLabel} aria-label={hiddenLabel} xmlns="http://www.w3.org/2000/svg">
      {@html icon.body}
    </svg>
  </Tooltip>
{/if}

<style>
  svg.inline {
    vertical-align: -0.125em;
  }
  svg.vFlip {
    transform: scale(1, -1);
  }
  svg.hFlip {
    transform: scale(-1, 1);
  }
  svg.hFlip.vFlip {
    transform: scale(-1, -1);
  }
</style>
