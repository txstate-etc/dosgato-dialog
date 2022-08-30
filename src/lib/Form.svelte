<script lang="ts">
  import { Form, FormStore } from '@txstate-mws/svelte-forms'
  import type { Feedback, SubmitResponse } from '@txstate-mws/svelte-forms'
  import { setContext } from 'svelte'
  import { CHOOSER_API_CONTEXT, type Client } from './chooser'

  type T = $$Generic
  type F = $$Generic

  let className = ''
  export { className as class }
  export let submit: (state: T) => Promise<SubmitResponse<T>> = undefined
  export let validate: (state: T) => Promise<Feedback[]> = undefined
  export let store: FormStore<T> = undefined
  export let chooserClient: Client<F>|undefined = undefined
  export let autocomplete: string|undefined = undefined
  export let name: string|undefined = undefined
  export let preload: T|undefined = undefined

  setContext(CHOOSER_API_CONTEXT, chooserClient)
</script>

<Form bind:store class="{className} dialog-form" {submit} {validate} on:saved {autocomplete} {name} {preload} let:messages let:allMessages let:saved let:valid let:invalid let:validating let:submitting>
  <slot {messages} {saved} {validating} {submitting} {valid} {invalid} />
  <div class="form-errors" aria-live='assertive'>
    {#if messages.length}
      <ul>
        {#each messages as message}
          <li>{message.message}</li>
        {/each}
        {#if invalid}
          <li>More errors. See inline messages for details.</li>
        {/if}
      </ul>
    {:else if invalid}
      This form contains validation errors. See inline messages for details.
    {/if}
  </div>
  <slot name="submit" {saved} {validating} {submitting} {valid} {invalid} />
</Form>

<style>
  :global(.dialog-form *) {
    box-sizing: border-box;
  }
  :global(.dialog-form) {
    padding: 0;
  }
  .form-errors {
    color: #9a3332;
    padding: 1em;
  }
</style>
