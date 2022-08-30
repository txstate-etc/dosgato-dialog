<script lang="ts">
  import { nullableSerialize, nullableDeserialize } from '@txstate-mws/svelte-forms'
  import FieldStandard from './FieldStandard.svelte'
  let className = ''
  export { className as class }
  export let id: string | undefined = undefined
  export let path: string
  export let label: string = ''
  export let placeholder: string = 'Select' + (label ? ' ' + label : '')
  export let notNull = false
  export let disabled = false
  export let choices: { label?: string, value: string, disabled?: boolean }[]
  export let defaultValue: any = notNull ? choices[0].value : undefined
  export let conditional: boolean|undefined = undefined
  export let required = false
</script>

<FieldStandard bind:id {label} {path} {required} {defaultValue} {conditional} serialize={!notNull && nullableSerialize} deserialize={!notNull && nullableDeserialize} let:value let:valid let:invalid let:id let:onBlur let:onChange let:messagesid>
  <select {id} name={path} {disabled} class="dialog-input dialog-select {className}" on:change={onChange} on:blur={onBlur} class:valid class:invalid aria-describedby={messagesid}>
    {#if !notNull}<option value="" selected={!value}>{placeholder}</option>{/if}
    {#each choices as choice (choice.value)}
      <option value={choice.value} disabled={choice.disabled} selected={value === choice.value}>{choice.label || choice.value}</option>
    {/each}
  </select>
</FieldStandard>
