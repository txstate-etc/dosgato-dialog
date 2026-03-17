<!-- @component
  The purpose of this component is to provide common `Feedback` message styling with icons that support screen readers.
-->
<script lang="ts">
  import type { Feedback } from '@txstate-mws/svelte-forms'
  import { htmlEncode } from 'txstate-utils'

  import { messageIcons, messageLabels } from '$lib'
  import Icon from './Icon.svelte'
  export let message: Feedback

  $: icon = messageIcons[message.type] ?? messageIcons.error
  $: iconLabel = messageLabels[message.type] ?? messageLabels.error

  function addMarkup (msg: string) {
    const lines = msg.split(/\r?\n/)
    const output: string[] = []
    for (const line of lines) {
      const splitLinks = line.split(/((?:\[[^\]]+\])?\([^)]+\))/)
      const replaced: string[] = []
      for (const segment of splitLinks) {
        const m = segment.match(/(?:\[([^\]]+)\])?\(([^)]+)\)/)
        if (m) {
          try {
            const url = new URL(m[2])
            replaced.push('<a href="' + htmlEncode(url.toString()) + '" target="_blank">' + htmlEncode(m[1] || m[2]) + '</a>')
          } catch {
            replaced.push(htmlEncode(m[0]))
          }
        } else {
          replaced.push(htmlEncode(segment))
        }
      }
      output.push(replaced.join(''))
    }
    return output.join('<br>')
  }
</script>

<div class={message.type}><Icon width='1.5em' {icon} inline hiddenLabel={iconLabel} /><span>{@html addMarkup(message.message)}</span></div>

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
    background-color: var(--dg-danger-bg, #9a3332);
    color: var(--dg-danger-text, white);
  }
  div.warning {
    background-color: var(--dg-warning-bg, #ffc107);
    color: var(--dg-warning-text, black);
  }
  div.success {
    background-color: var(--dg-success-bg, #218739);
    color: var(--dg-success-text, white);
  }
  div :global(a) {
    color: inherit;
  }
</style>
