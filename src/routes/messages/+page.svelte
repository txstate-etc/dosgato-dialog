<script lang="ts">
  import type { Feedback, FormStore } from '@txstate-mws/svelte-forms'
  import apertureLight from '@iconify-icons/ph/aperture-light'
  import { isBlank } from 'txstate-utils'
  import { FieldRadio, FieldText, FormDialog, type CropOutput } from '$lib'
  import { demoChooserAPI } from '../../demo/DemoChooserAPI'
  import { demoTagClient } from '../../demo/DemoTagAPI'
  let store: FormStore
  let showdialog = true
  async function submit (data: { crop: CropOutput }) {
    return {
      success: true,
      data,
      messages: []
    }
  }

  async function validate (data: any): Promise<Feedback[]> {
    const feedback: Feedback[] = []
    if (isBlank(data.name)) {
      feedback.push({ type: 'error', path: 'name', message: 'Name is required' })
    }
    if (isBlank(data.email)) {
      feedback.push({ type: 'error', path: 'email', message: 'Email is required' })
    }
    return feedback
  }

</script>

<svelte:head><title>Premature Error Messages Issue</title></svelte:head>
<h1>Premature Error Messages Issue</h1>
<p>
  This page demonstrates the issue with error messages appearing before a user has interacted with a dialog. 
</p>

<main>
  {#if showdialog}
  <FormDialog bind:store title="Form with Validation" {submit} {validate} icon={apertureLight} chooserClient={demoChooserAPI} tagClient={demoTagClient} size="large" on:escape={() => { showdialog = false }} let:saved let:data >
    <FieldText path="name" label="Name" required />
    <FieldText path="email" label="Email" required />
    <FieldRadio path="shirt" label="Would you like a free t-shirt?" choices={[{ value: 'yes' }, { value: 'no' }]} notNull />
    <svelte:fragment slot="submit" let:saved>
      <button>Save</button>
      {#if saved}Save successful!{/if}
    </svelte:fragment>
  </FormDialog>
  {/if}
  <button on:click={() => { showdialog = true }}>Show Dialog</button>
</main>

<style>
  main {
    padding-right: max(30%,10em);
  }
</style>
