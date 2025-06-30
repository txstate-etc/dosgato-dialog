<script lang="ts" generics="T extends Record<string, any> = Record<string, any>, F = any">
  import type { IconifyIcon } from '@iconify/svelte'
  import contentSave from '@iconify-icons/mdi/content-save'
  import type { Feedback, FormStore } from '@txstate-mws/svelte-forms'
  import { type ComponentProps } from 'svelte'
  import { Form } from '$lib'
  import Dialog from './Dialog.svelte'

  interface $$Props extends ComponentProps<Form<T, F>> {
    title?: string
    icon?: IconifyIcon
    size?: 'tiny' | 'small' | 'normal' | 'large'
    expandable?: boolean
  }

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
  }

  export let store: FormStore<T> | undefined = undefined
  export let title: string = ''
  export let icon: IconifyIcon | undefined = undefined
  export let size: 'tiny' | 'small' | 'normal' | 'large' = 'normal'
  export let expandable = true

  async function onSubmit () {
    await store!.submit()
  }
</script>

<Dialog continueText="Save" continueIcon={contentSave} cancelText="Cancel" on:escape on:continue={onSubmit} {title} {icon} {size} escapable={false} {expandable}>
  <Form bind:store {...$$restProps} on:saved on:autosaved on:validationfail let:messages let:allMessages let:showingInlineErrors let:saved let:valid let:invalid let:validating let:submitting let:data>
    <slot {messages} {allMessages} {saved} {validating} {submitting} {valid} {invalid} {data} {showingInlineErrors} />
  </Form>
</Dialog>

<style>
  :global(:root) {
    --ck-z-default: var(--popup-z, 3001);
  }
</style>
