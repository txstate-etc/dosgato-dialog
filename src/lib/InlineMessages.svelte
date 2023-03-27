<!-- @component
  This renders the `Feedback` messages bound to it if there are any to display.
-->
<script lang="ts">
  import type { Feedback } from '@txstate-mws/svelte-forms'
  import { randomid } from 'txstate-utils'
  import InlineMessage from './InlineMessage.svelte'

  export let messages: Feedback[]
  export let id: string|undefined = randomid()

  const savedid = id
  $: id = messages.length ? savedid : undefined
</script>

{#if id}
  <div {id}>
    {#each messages as message}
      <InlineMessage {message} />
    {/each}
  </div>
{/if}

<style>
  div {
    width: 100%;
  }
</style>
