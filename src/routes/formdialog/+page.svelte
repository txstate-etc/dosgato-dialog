<script lang="ts">
  import type { Feedback, FormStore } from '@txstate-mws/svelte-forms'
  import apertureLight from '@iconify-icons/ph/aperture-light'
  import { isBlank } from 'txstate-utils'
  import { FieldText, FieldTextArea, FormDialog } from '$lib'

  let store: FormStore
  let showdialog = true

  async function submit (data: any) {
    return {
      success: true,
      data,
      messages: []
    }
  }

  async function validate (data: any): Promise<Feedback[]> {
    const feedback: Feedback[] = []
    if (isBlank(data.name)) {
      feedback.push({ type: 'error', path: 'name', message: 'Name is required.' })
    }
    if (isBlank(data.email)) {
      feedback.push({ type: 'error', path: 'email', message: 'Email is required.' })
    }
    if (data.name && data.name === data.email) {
      feedback.push({ type: 'error', path: '', message: 'Name and email must be different.' })
    }
    if (data.bio && data.bio.length > 200) {
      feedback.push({ type: 'warning', path: '', message: 'Bio is quite long. Consider shortening.' })
    }
    return feedback
  }
</script>

<svelte:head><title>FormDialog Footer Error Test</title></svelte:head>
<h1>FormDialog Footer Error Test</h1>
<p>Click Save with empty fields to see the footer error message. Set name and email to the same value to see a non-field error alongside inline errors.</p>

<main>
  {#if showdialog}
    <FormDialog bind:store title="Test Form" {submit} {validate} icon={apertureLight} size="normal" on:escape={() => { showdialog = false }}>
      <FieldText path="name" label="Name" required />
      <FieldText path="email" label="Email" required />
      <FieldTextArea path="bio" label="Bio" rows={6} />
      <FieldText path="filler1" label="Filler 1" />
      <FieldText path="filler2" label="Filler 2" />
      <FieldText path="filler3" label="Filler 3" />
      <FieldText path="filler4" label="Filler 4" />
    </FormDialog>
  {/if}
  <button on:click={() => { showdialog = true }}>Show Dialog</button>
</main>
