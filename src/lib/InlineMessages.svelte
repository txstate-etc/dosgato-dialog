<script lang="ts">
  import type { Feedback } from '@txstate-mws/svelte-forms'
  import InlineMessage from './InlineMessage.svelte'

  export let messages: Feedback[]
</script>

{#each messages as message}
  <InlineMessage {message} />
{/each}
