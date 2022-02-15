<script lang="ts">
  import type { Feedback } from '@txstate-mws/svelte-forms'
  import { randomid } from 'txstate-utils'
  import InlineMessage from './InlineMessage.svelte'

  export let id: string|undefined = randomid()
  export let messages: Feedback[]

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
