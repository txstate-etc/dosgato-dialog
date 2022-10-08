<script lang="ts">
  import { Field, nullableSerialize, nullableDeserialize } from '@txstate-mws/svelte-forms'
  import { randomid } from 'txstate-utils'

  export let path: string
  export let conditional: boolean|undefined = undefined
</script>

<Field {path} {conditional} defaultValue={randomid()} serialize={nullableSerialize} deserialize={nullableDeserialize} let:value>
  <input type="hidden" name={path} {value}>
</Field>
