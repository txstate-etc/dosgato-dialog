<script lang="ts">
  import { nullableSerialize, nullableDeserialize } from '@txstate-mws/svelte-forms'
  import FieldStandard from './FieldStandard.svelte'
  import Input from './Input.svelte'
  let className = ''
  export { className as class }
  export let id: string | undefined = undefined
  export let path: string
  export let label: string = ''
  export let nullable = true
  export let defaultValue: any = nullable ? undefined : ''
  export let type: string = 'text'
  export let allowlastpass = false
  export let maxlength: number|undefined = undefined
  export let conditional: boolean|undefined = undefined
</script>

<FieldStandard bind:id {label} {path} {defaultValue} {conditional} serialize={nullable && nullableSerialize} deserialize={nullable && nullableDeserialize} let:value let:valid let:invalid let:id let:onBlur let:onChange>
  <Input {type} name={path} {value} {id} class="dialog-input {className}" {allowlastpass} {onChange} {onBlur} {valid} {invalid} {maxlength}></Input>
</FieldStandard>
