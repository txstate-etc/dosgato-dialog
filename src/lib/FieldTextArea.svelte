<script lang="ts">
  import { getDescribedBy } from '$lib'
  import { type HTMLActionEntry, passActions } from '@txstate-mws/svelte-components'
  import { nullableSerialize, nullableDeserialize } from '@txstate-mws/svelte-forms'
  import FieldStandard from './FieldStandard.svelte'
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
  export let maxlength: number | undefined = undefined
  export let rows: number | undefined = undefined
  export let conditional: boolean | undefined = undefined
  export let required = false
  export let use: HTMLActionEntry[] = []
  export let inputelement: HTMLTextAreaElement = undefined as any
  export let related: true | number = 0
  export let extradescid: string | undefined = undefined
  export let helptext: string | undefined = undefined
</script>

<FieldStandard bind:id {label} {path} {required} {defaultValue} {conditional} {related} {helptext} serialize={!notNull ? nullableSerialize : undefined} deserialize={!notNull ? nullableDeserialize : undefined} let:value let:valid let:invalid let:id let:onBlur let:onChange let:messagesid let:helptextid>
  <textarea bind:this={inputelement} {placeholder} name={path} {value} {id} {rows} class="dialog-input dialog-textarea {className}" class:valid class:invalid aria-invalid={invalid} aria-describedby={getDescribedBy([messagesid, helptextid, extradescid])} on:change={onChange} on:blur={onBlur} on:keyup={onChange} on:paste use:passActions={use}></textarea>
  {#if isNotNull(maxlength)}
    <MaxLength {value} {maxlength}/>
  {/if}
</FieldStandard>

<style>
  textarea {
    resize: vertical;
  }
</style>
