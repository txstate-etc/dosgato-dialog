<script lang="ts">
  import type { HTMLActionEntry } from '@txstate-mws/svelte-components'
  import { nullableSerialize, nullableDeserialize } from '@txstate-mws/svelte-forms'
  import FieldStandard from './FieldStandard.svelte'
  import Input from './Input.svelte'
  import MaxLength from './MaxLength.svelte'
  import { isNotNull } from 'txstate-utils'

  let className = ''
  export { className as class }
  export let id: string | undefined = undefined
  export let path: string
  export let label: string = ''
  export let placeholder: string | undefined = undefined
  export let notNull = false
  export let defaultValue: any = notNull ? '' : undefined
  export let type: string = 'text'
  export let allowlastpass = false
  export let maxlength: number | undefined = undefined
  export let conditional: boolean | undefined = undefined
  export let required = false
  export let use: HTMLActionEntry[] = []
  export let inputelement: HTMLInputElement = undefined as any
  export let related: true | number = 0
  export let autocomplete = 'off'
  export let extradescid: string | undefined = undefined
  export let helptext: string | undefined = undefined
</script>

<FieldStandard bind:id {label} {path} {required} {defaultValue} {conditional} {related} {helptext} serialize={!notNull ? nullableSerialize : undefined} deserialize={!notNull ? nullableDeserialize : undefined} let:value let:valid let:invalid let:id let:onBlur let:onChange let:messagesid let:helptextid>
  <Input bind:inputelement {type} {placeholder} {autocomplete} name={path} {value} {id} class="dialog-input {className}" {allowlastpass} {onChange} {onBlur} {valid} {invalid} {messagesid} {helptextid} {extradescid} {use}></Input>
  {#if isNotNull(maxlength)}
    <MaxLength {value} {maxlength}/>
  {/if}
</FieldStandard>
