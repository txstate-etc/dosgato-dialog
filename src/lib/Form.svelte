<script lang="ts">
  import { Form, type FormStore, type Feedback, type SubmitResponse } from '@txstate-mws/svelte-forms'
    import { setContext } from 'svelte'
  import { CHOOSER_API_CONTEXT, type Client } from './chooser'

  type T = $$Generic<any>
  type F = $$Generic<any>

  let className = ''
  export { className as class }
  export let submit: ((state: T) => Promise<SubmitResponse<T>>) | undefined = undefined
  export let validate: ((state: T) => Promise<Feedback[]>) | undefined = undefined
  export let store: FormStore<T> = undefined as any
  export let chooserClient: Client<F> | undefined = undefined
  export let autocomplete: string | undefined = undefined
  export let name: string | undefined = undefined
  export let preload: T | undefined = undefined

  setContext(CHOOSER_API_CONTEXT, chooserClient)
</script>

<Form bind:store class="{className} dialog-form" {submit} {validate} on:saved {autocomplete} {name} {preload} let:messages let:allMessages let:showingInlineErrors let:saved let:valid let:invalid let:validating let:submitting let:data>
  <slot {messages} {saved} {validating} {submitting} {valid} {invalid} {data} {allMessages} {showingInlineErrors} />
  {#if messages.length || showingInlineErrors}
    <div class="form-errors" aria-live='assertive'>
      {#if messages.length}
        <ul>
          {#each messages as message}
            <li>{message.message}</li>
          {/each}
          {#if showingInlineErrors}
            <li>More errors. See inline messages for details.</li>
          {/if}
        </ul>
      {:else if showingInlineErrors}
        This form contains validation errors. See inline messages for details.
      {/if}
    </div>
  {/if}
  <slot name="submit" {saved} {validating} {submitting} {valid} {invalid} {allMessages} {showingInlineErrors} />
</Form>

<style>
  :global(.dialog-form *) {
    box-sizing: border-box;
  }
  :global(.dialog-form) {
    padding: 0;
  }
  :global(.dialog-content > .dialog-form) {
    margin: -2em 0;
  }
  .form-errors {
    color: var(--dg-danger-bg, #9a3332);
    padding: 1em;
  }
</style>
