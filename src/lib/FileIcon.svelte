<script lang="ts">
  import Icon from './Icon.svelte'
  import { iconForMime } from './fileIcons'
  export let mime: string
  export let hiddenLabel: string | undefined = undefined
  export let inline: boolean = false
  export let width: string | number = '1em'
  export let height: string | number = width

  $: icon = iconForMime(mime)
</script>

<Icon {icon} {hiddenLabel} {inline} {width} {height} />
