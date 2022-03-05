<script lang="ts">
  import FieldStandard from './FieldStandard.svelte'
  import Input from './Input.svelte'
  import { numberDeserialize, numberNullableDeserialize, numberSerialize } from '@txstate-mws/svelte-forms'
  let className = ''
  export { className as class }
  export let id: string|undefined = undefined
  export let path: string
  export let label: string = ''
  export let defaultValue: number|undefined = undefined
  export let nullable = false
  export let min: number|undefined = undefined
  export let max: number|undefined = undefined
  export let step: number|undefined = undefined
  export let conditional: boolean|undefined = undefined
  export let required = false
</script>

<FieldStandard bind:id {label} {path} {required} {defaultValue} {conditional} serialize={numberSerialize} deserialize={nullable ? numberNullableDeserialize : numberDeserialize} let:value let:valid let:invalid let:id let:onBlur let:onChange>
  <Input type="number" name={path} {value} {id} class="dialog-input {className}" {onChange} {onBlur} {valid} {invalid} {min} {max} {step}></Input>
</FieldStandard>
