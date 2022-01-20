<script lang="ts">
  import { Form, AddMore } from '@txstate-mws/svelte-forms'
  import type { Feedback } from '@txstate-mws/svelte-forms'
  import TextInput from '$lib/TextInput.svelte'

  async function submit (data) {
    return {
      success: true,
      data,
      messages: []
    }
  }

  async function validate (data): Promise<Feedback[]> {
    return [{
      type: 'error',
      message: 'Nope',
      path: 'multi.0.name'
    }]
  }
</script>

<h1>DosGato Dialog Example</h1>

<Form {submit} {validate} let:saved>
  This is an example form.
  <TextInput path="test" label="Test" />
  <fieldset>
    <AddMore path="multi" initialState={{ name: 'Barney' }} let:index>
      <TextInput path="name" {index} label={'Name ' + index} />
    </AddMore>
  </fieldset>
  {#if saved}Save successful!{/if}
  <button>Submit</button>
</Form>
