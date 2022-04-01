<script lang="ts">
  import type { Feedback } from '@txstate-mws/svelte-forms'
  import alertCircleOutline from '@iconify-icons/mdi/alert-circle-outline.js'
  import checkCircleOutline from '@iconify-icons/mdi/check-circle-outline.js'
  import informationOutline from '@iconify-icons/mdi/information-outline.js'
  import closeOctagonOutline from '@iconify-icons/mdi/close-octagon-outline.js'

  import Icon from './Icon.svelte'
  export let message: Feedback

  const icons = {
    error: alertCircleOutline,
    warning: informationOutline,
    success: checkCircleOutline,
    system: closeOctagonOutline
  }
  $: icon = icons[message.type] ?? alertCircleOutline
</script>

<div class={message.type}><Icon width='1.5em' {icon} hiddenLabel='Error' /><span>{message.message}</span></div>

<style>
  div {
    font-size: 0.9em;
    padding: 5px;
    margin-top: 0.5em;
    display: flex;
    align-items: center;
  }
  span {
    display: block;
    margin-left: 0.5em;
  }
  div.error, div.system {
    background-color: #9a3332;
    color: white;
  }
  div.warning {
    background-color: #ffc107;
    color: black;
  }
  div.success {
    background-color: #218739;
    color: white;
  }
</style>
