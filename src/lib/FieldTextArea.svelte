<script lang="ts">
  import { getDescribedBy } from '$lib'
  import { type HTMLActionEntry, passActions } from '@txstate-mws/svelte-components'
  import { nullableSerialize, nullableDeserialize } from '@txstate-mws/svelte-forms'
  import FieldStandard from './FieldStandard.svelte'
  let className = ''
  export { className as class }
  export let id: string | undefined = undefined
  export let path: string
  export let label: string = ''
  export let notNull = false
  export let defaultValue: any = notNull ? '' : undefined
  export let maxlength: number|undefined = undefined
  export let rows: number|undefined = undefined
  export let conditional: boolean|undefined = undefined
  export let required = false
  export let use: HTMLActionEntry[] = []
  export let inputelement: HTMLTextAreaElement = undefined as any
  export let helptext: string | undefined = undefined
</script>

<FieldStandard bind:id {label} {path} {required} {defaultValue} {conditional} {helptext} serialize={!notNull ? nullableSerialize : undefined} deserialize={!notNull ? nullableDeserialize : undefined} let:value let:valid let:invalid let:id let:onBlur let:onChange let:messagesid let:helptextid>
  <textarea bind:this={inputelement} name={path} {value} {id} {rows} class="dialog-input dialog-textarea {className}" class:valid class:invalid aria-invalid={invalid} aria-describedby={getDescribedBy([messagesid, helptextid])} on:change={onChange} on:blur={onBlur} on:keyup={onChange} on:paste {maxlength} use:passActions={use}></textarea>
</FieldStandard>

<style>
  textarea {
    resize: vertical;
  }
</style>
