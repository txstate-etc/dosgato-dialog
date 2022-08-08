<script lang="ts">
  import Icon from './Icon.svelte'
  import { iconForMime } from './fileIcons'
  export let mime: string
  export let hiddenLabel: string = undefined
  export let inline: boolean = false
  export let width: string|number = '1em'
  export let height: string|number = width
  export let vAlign: 'top'|'middle'|'bottom' = 'middle'

  $: icon = iconForMime(mime)
</script>

<Icon {icon} {hiddenLabel} {inline} {width} {height} {vAlign} />
