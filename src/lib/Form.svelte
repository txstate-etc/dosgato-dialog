<script lang="ts" generics="T = Record<string, any>, F = any">
  import { Form, type FormStore, type Feedback } from '@txstate-mws/svelte-forms'
  import { setContext, type ComponentProps } from 'svelte'
  import { CHOOSER_API_CONTEXT, type Client, messageIcons, TAG_API_CONTEXT, type TagClient } from '$lib'
  import Icon from './Icon.svelte'

  interface $$Slots {
    default: {
      messages: Feedback[]
      allMessages: Feedback[]
      saved: boolean
      validating: boolean
      submitting: boolean
      valid: boolean
      invalid: boolean
      showingInlineErrors: boolean
      data: Partial<T>
    }
    submit: {
      saved: boolean
      validating: boolean
      submitting: boolean
      allMessages: Feedback[]
      valid: boolean
      invalid: boolean
      showingInlineErrors: boolean
    }
  }
  interface $$Props extends ComponentProps<Form<T>> {
    tagClient?: TagClient
    chooserClient?: Client<F>
  }

  export let store: FormStore<T> = undefined as any
  export let chooserClient: Client<F> | undefined = undefined
  export let tagClient: TagClient | undefined = undefined

  setContext(CHOOSER_API_CONTEXT, chooserClient)
  setContext(TAG_API_CONTEXT, tagClient)
</script>

<Form bind:store {...$$restProps} class="{$$restProps.class} dialog-form" on:saved on:validationfail on:autosaved let:messages let:allMessages let:showingInlineErrors let:saved let:valid let:invalid let:validating let:submitting let:data>
  <slot {messages} {saved} {validating} {submitting} {valid} {invalid} {data} {allMessages} {showingInlineErrors} />
  {@const errorMessages = messages.filter(m => m.type === 'error' || m.type === 'system')}
  {@const warningMessages = messages.filter(m => m.type === 'warning')}
  {@const infoMessages = messages.filter(m => m.type === 'info')}
  {@const successMessages = messages.filter(m => m.type === 'success')}
  {#if errorMessages.length || showingInlineErrors}
    <ul class="form-errors" aria-live='assertive'>
      {#each errorMessages as message}
        <li><Icon icon={messageIcons[message.type] ?? messageIcons.error} inline hiddenLabel="error"/> {message.message}</li>
      {/each}
      {#if showingInlineErrors}
        <li><Icon icon={messageIcons.error} inline /> {#if errorMessages.length}More errors.{:else}This form contains validation errors.{/if} See inline messages for details.</li>
      {/if}
    </ul>
  {/if}
  {#if warningMessages.length}
    <ul class="form-warnings" aria-live='assertive'>
      {#each warningMessages as message}
        <li><Icon icon={messageIcons.warning} inline hiddenLabel="warning"/> {message.message}</li>
      {/each}
    </ul>
  {/if}
  {#if infoMessages.length}
    <ul class="form-info" aria-live='assertive'>
      {#each infoMessages as message}
        <li><Icon icon={messageIcons.info} inline hiddenLabel="info"/> {message.message}</li>
      {/each}
    </ul>
  {/if}
  {#if successMessages.length}
    <ul class="form-successes" aria-live='assertive'>
      {#each successMessages as message}
        <li><Icon icon={messageIcons.success} inline hiddenLabel="success" /> {message.message}</li>
      {/each}
    </ul>
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
  ul {
    list-style-type: none;
    padding: 0.5em;
  }
  .form-errors {
    background-color: var(--dg-danger-bg, #9a3332);
    color: var(--dg-danger-text, white);
  }
  .form-warnings {
    background-color: var(--dg-warning-bg, #ffc107);
    color: var(--dg-warning-text, black);
  }
  .form-info {
    background-color: var(--dg-info-bg, #619bff);
    color: var(--dg-info-text, black);
  }
  .form-successes {
    background-color: var(--dg-success-bg, #218739);
    color: var(--dg-success-text, white);
  }
</style>
