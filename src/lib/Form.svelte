<script lang="ts">
  import { Feedback, Form, FormStore, SubmitResponse } from '@txstate-mws/svelte-forms'
  import { createEventDispatcher } from 'svelte'
  let className = ''
  export { className as class }
  export let submit: (state: any) => Promise<SubmitResponse<any>> = undefined
  export let validate: (state: any) => Promise<Feedback[]> = undefined
  export let success: () => void|Promise<void> = undefined
  export let store: FormStore = undefined
  export let autocomplete: string|undefined = undefined
  export let name: string|undefined = undefined
  const dispatch = createEventDispatcher()
  function onCancel () {
    dispatch('close')
  }
</script>

<Form bind:store class="{className} dialog-form" {submit} {validate} {success} {autocomplete} {name} let:messages let:saved let:valid let:invalid let:validating let:submitting>
  <slot {messages} {saved} {validating} {submitting} {valid} {invalid} />
  <div class="dialog-buttons">
    <slot name="buttons" {onCancel}>
      <button type="button" on:click={onCancel}>Cancel</button>
      <button>Save</button>
    </slot>
  </div>
</Form>

<style>
  :global(.dialog-form *) {
    box-sizing: border-box;
  }
  :global(.dialog-form) {
    padding: 0;
  }
  :global(.dialog-form fieldset) {
    border: 1px solid #666666;
    border-width: 1px 0;
    padding: 1em 0;
    margin: 2em 0;
  }
  .dialog-buttons {
    display: flex;
    justify-content: flex-end;
  }
  .dialog-buttons > * {
    margin-left: 1em;
  }
  .dialog-buttons :global(button) {
    padding: 0.4em 0.8em;
    min-width: 8em;
  }
</style>
