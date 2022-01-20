<script lang="ts">
  import type { Feedback } from '@txstate-mws/svelte-forms'

  export let message: Feedback
</script>

<div class={message.type}>{message.message}</div>

<style>
  div.error {
    border: 1px solid #65101A;
    background-color: #dc3545;
    padding: 5px;
    color: white;
  }
</style>
