<script lang="ts">
  import { FieldDate, FieldDateTime, FormDialog } from '$lib'
  import type { FormStore } from '@txstate-mws/svelte-forms'

  let store: FormStore
  let showdialog = true

  async function submit (data) {
    return {
      success: true,
      data,
      messages: []
    }
  }
</script>

<div class="container">
  <main>
    {#if showdialog}
      <FormDialog {submit} bind:store title="Date Fields" on:escape={() => { showdialog = false }}>
        <FieldDate path="date" label="Date (not clearable)" />
        <FieldDate path="date_clearable" label="Date (clearable)" clearable helptext="This is a fairly long bit of helptext that will help me to see what's up with the wrapping when Clear Field is out"/>
        <FieldDate path="date_required" label="Date (clearable + required)" clearable required />
        <FieldDateTime path="datetime" label="Date & Time (not clearable)" />
        <FieldDateTime path="datetime_clearable" label="Date & Time (clearable)" clearable />
        <FieldDateTime path="datetime_required" label="Date & Time (clearable + required)" clearable required />
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
