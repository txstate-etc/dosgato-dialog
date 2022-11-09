<script lang="ts">
  import type { IconifyIcon } from '@iconify/svelte'
  import contentSave from '@iconify-icons/mdi/content-save'
  import type { Feedback, FormStore, SubmitResponse } from '@txstate-mws/svelte-forms'
  import { createEventDispatcher, setContext } from 'svelte'
  import { CHOOSER_API_CONTEXT, Form } from '$lib'
  import Dialog from './Dialog.svelte'

  type T = $$Generic

  interface $$Events {
    saved: CustomEvent<T>
    escape: CustomEvent<undefined>
  }

  export let submit: (state: T) => Promise<SubmitResponse<T>>
  export let validate: undefined|((state: T) => Promise<Feedback[]>) = undefined
  export let store: FormStore<T>|undefined = undefined
  export let chooserClient = undefined
  export let autocomplete: string|undefined = undefined
  export let name: string|undefined = undefined
  export let title: string = ''
  export let icon: IconifyIcon = undefined
  export let size: 'tiny'|'small'|'normal'|'large' = 'normal'
  export let preload: T|undefined = undefined

  const dispatch = createEventDispatcher()

  async function onSubmit () {
    const resp = await store!.submit()

    if (resp.success) dispatch('saved', resp.data)
  }

  setContext(CHOOSER_API_CONTEXT, chooserClient)
</script>

<Dialog continueText="Save" continueIcon={contentSave} cancelText="Cancel" on:escape on:continue={onSubmit} {title} {icon} {size}>
  <Form bind:store {submit} {validate} {chooserClient} {autocomplete} {name} {preload} on:saved let:messages let:saved let:valid let:invalid let:validating let:submitting let:data>
    <slot {messages} {saved} {validating} {submitting} {valid} {invalid} {data} />
  </Form>
</Dialog>

<style>
  :global(:root) {
    --ck-z-default: var(--popup-z, 3001);
  }
</style>
