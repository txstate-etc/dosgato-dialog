<script lang="ts">
  import { Field, nullableSerialize, nullableDeserialize, FormStore, FORM_CONTEXT } from '@txstate-mws/svelte-forms'
  import { getContext } from 'svelte'
  export let id: string | undefined = undefined
  export let path: string
  export let value = ''
  export let notNull = false
  export let conditional: boolean|undefined = undefined
  const store = getContext<FormStore>(FORM_CONTEXT)
  $: store.setField(path, value)
</script>

<Field {path} {conditional} serialize={!notNull ? nullableSerialize : undefined} deserialize={!notNull ? nullableDeserialize : undefined} let:value>
  <input type="hidden" name={path} {value} {id}>
</Field>
