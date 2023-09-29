<script lang="ts">
  import { Field, nullableSerialize, nullableDeserialize } from '@txstate-mws/svelte-forms'
  import { randomid } from 'txstate-utils'
  import { onMount } from 'svelte'

  export let path: string
  export let conditional: boolean | undefined = undefined
  export let length: number = 10

  let val: any, stVal: (val: any, notDirty?: boolean) => void
  function updateValue (valu: any, sVal: any) {
    val = valu
    stVal = sVal
  }
  onMount(() => {
    if (!val) stVal(randomid(length))
  })
</script>

<Field {path} {conditional} defaultValue={randomid(length)} serialize={nullableSerialize} deserialize={nullableDeserialize} let:value let:setVal>
  {@const _ = updateValue(value, setVal)}
  <input type="hidden" name={path} {value}>
</Field>
