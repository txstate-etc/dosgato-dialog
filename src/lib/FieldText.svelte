<script lang="ts">
  import type { HTMLActionEntry } from '@txstate-mws/svelte-components'
  import { nullableSerialize, nullableDeserialize } from '@txstate-mws/svelte-forms'
  import FieldStandard from './FieldStandard.svelte'
  import Input from './Input.svelte'
  let className = ''
  export { className as class }
  export let id: string | undefined = undefined
  export let path: string
  export let label: string = ''
  export let notNull = false
  export let defaultValue: any = notNull ? '' : undefined
  export let type: string = 'text'
  export let allowlastpass = false
  export let maxlength: number|undefined = undefined
  export let conditional: boolean|undefined = undefined
  export let required = false
  export let use: HTMLActionEntry[] = []
  export let inputelement: HTMLInputElement = undefined
</script>

<FieldStandard bind:id {label} {path} {required} {defaultValue} {conditional} serialize={!notNull && nullableSerialize} deserialize={!notNull && nullableDeserialize} let:value let:valid let:invalid let:id let:onBlur let:onChange let:messagesid>
  <Input bind:inputelement {type} name={path} {value} {id} class="dialog-input {className}" {allowlastpass} {onChange} {onBlur} {valid} {invalid} {maxlength} {messagesid} {use}></Input>
</FieldStandard>
