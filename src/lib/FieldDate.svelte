<script lang="ts">
  import { dateSerialize, dateDeserialize } from '@txstate-mws/svelte-forms'
  import FieldStandard from './FieldStandard.svelte'
  import Input from './Input.svelte'
  let className = ''
  export { className as class }
  export let id: string | undefined = undefined
  export let path: string
  export let label: string = ''
  export let defaultValue: any = undefined
  export let min: Date | { toJSDate: () => Date } | undefined = undefined
  export let max: Date | { toJSDate: () => Date } | undefined = undefined
  export let step: number | undefined = undefined
  export let conditional: boolean | undefined = undefined
  export let required = false
  export let inputelement: HTMLInputElement = undefined as any
  export let related: true | number = 0
  export let extradescid: string | undefined = undefined
  export let helptext: string | undefined = undefined
</script>

<FieldStandard bind:id {label} {path} {required} {defaultValue} {conditional} {related} {helptext} serialize={dateSerialize} deserialize={dateDeserialize} let:value let:valid let:invalid let:id let:onBlur let:onChange let:messagesid let:helptextid>
  <Input bind:inputelement type="date" name={path} {value} {id} class="dialog-input {className}" {onChange} {onBlur} {valid} {invalid} {min} {max} {step} {extradescid} {messagesid} {helptextid}/>
</FieldStandard>
