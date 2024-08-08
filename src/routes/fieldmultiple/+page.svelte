<script lang="ts">
  import { FieldMultiple, FieldRadio, FieldText, FormDialog } from '$lib'
  import type { Feedback, FormStore } from '@txstate-mws/svelte-forms'

  let store: FormStore
  let showdialog = true

  async function submit (data) {
    return {
      success: true,
      data,
      messages: []
    }
  }

  async function validate (data: any): Promise<Feedback[]> {
    const feedback: Feedback[] = []
    if (data.title?.length < 10) {
      feedback.push({ type: 'error', path: 'title', message: 'Title must be at least 10 characters' })
    }
    return feedback
  }
</script>
  <div class="container">
    <main>
      {#if showdialog}
        <FormDialog {submit} {validate} bind:store title="Example Dialog" on:escape={() => { showdialog = false }} let:data>
          <FieldMultiple path="contacts" label="Contacts" reorder removable let:index>
            <FieldRadio path="method" label="Method" notNull defaultValue="lookup" choices={[{ value: 'lookup', label: 'lookup by email' }, { value: 'manual', label: 'Manual' }]} />
            {@const manual = data.contacts?.length && data.contacts[index]?.method === 'manual'}
            <FieldText path="email" label="Email" required conditional={!manual}/>
            <FieldText path="first" label="First Name" required conditional={manual}/>
            <FieldText path="last" label="Last Name" required conditional={manual}/>
          </FieldMultiple>
        </FormDialog>
      {/if}
      <button on:click={() => { showdialog = true }}>Show Dialog</button>
    </main>
    <aside>
      <pre>{JSON.stringify($store?.data, null, 2)}</pre>
    </aside>
  </div>
  <style>
    .container {
      display: flex;
    }
    main {
      width: 75%;
    }
    aside {
      width: 25%;
    }
  </style>

