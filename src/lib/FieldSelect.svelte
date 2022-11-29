<script lang="ts">
  import { getDescribedBy } from '$lib'
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
  export let inputelement: HTMLSelectElement = undefined
  export let helptext: string | undefined = undefined
  export let number = false
  export let date = false
  export let datetime = false
  export let serialize: ((value: any) => string)|undefined = undefined
  export let deserialize: ((value: string) => any)|undefined = undefined
</script>

<FieldStandard bind:id {label} {path} {required} {defaultValue} {conditional} {helptext} {notNull} {number} {date} {datetime} {serialize} {deserialize} let:value let:valid let:invalid let:id let:onBlur let:onChange let:messagesid let:helptextid let:serialize>
  <select bind:this={inputelement} {id} name={path} {disabled} class="dialog-input dialog-select {className}" on:change={onChange} on:blur={onBlur} class:valid class:invalid aria-describedby={getDescribedBy([messagesid, helptextid])}>
    {#if !notNull}<option value="" selected={!value}>{placeholder}</option>{/if}
    {#each choices as choice (choice.value)}
      {@const serializedValue = serialize(choice.value)}
      <option value={serializedValue} disabled={choice.disabled} selected={value === serializedValue}>{choice.label || serializedValue}</option>
    {/each}
  </select>
</FieldStandard>
