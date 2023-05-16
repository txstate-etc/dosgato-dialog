<script lang="ts">
  import { Field, nullableSerialize, nullableDeserialize } from '@txstate-mws/svelte-forms'
  import { randomid } from 'txstate-utils'

  export let path: string
  export let conditional: boolean|undefined = undefined
  export let length: number = 10
</script>

<Field {path} {conditional} defaultValue={randomid(length)} serialize={nullableSerialize} deserialize={nullableDeserialize} let:value>
  <input type="hidden" name={path} {value}>
</Field>
