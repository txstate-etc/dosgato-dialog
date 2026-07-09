<script>
  import { Form } from '@txstate-mws/svelte-forms'
  import FieldMultiple from '../src/lib/FieldMultiple.svelte'
  import FieldText from '../src/lib/FieldText.svelte'

  let showmultiple = true
  let store

  export function setShow (v) { showmultiple = v }
  export function getStore () { return store }

  async function submit (data) {
    return { success: true, data, messages: [] }
  }
</script>

<Form bind:store {submit}>
  <FieldMultiple path="contacts" label="Contacts" conditional={showmultiple} removable helptext="People to contact.">
    <FieldText path="email" label="Email" />
  </FieldMultiple>
</Form>
