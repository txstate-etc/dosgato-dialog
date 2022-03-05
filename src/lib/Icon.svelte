<script lang="ts">
  import Icon from '@iconify/svelte/dist/OfflineIcon.svelte'
  import type { IconifyIcon } from '@iconify/svelte'
  import { ScreenReaderOnly } from '@txstate-mws/svelte-components'
  export let icon: IconifyIcon|undefined
  export let hiddenLabel: string = undefined
  export let inline: boolean = false
  export let width: string|number = '1em'
  export let height: string|number = width
  export let vAlign: 'top'|'middle'|'bottom' = 'middle'
</script>

{#if icon}
  <Icon {icon} {inline} {width} {height} {vAlign} />
  {#if hiddenLabel}
    <ScreenReaderOnly>{hiddenLabel}</ScreenReaderOnly>
  {/if}
{/if}
