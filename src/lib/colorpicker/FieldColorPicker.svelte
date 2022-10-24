<script lang="ts">
  import FieldStandard from '../FieldStandard.svelte'
  import type { ColorPickerOption } from './colorpicker'
  import { keyby } from 'txstate-utils'

  export let id: string | undefined = undefined
  let className = ''
  export { className as class }
  export let path: string
  export let options: ColorPickerOption[]
  export let label: string = ''
  export let required = false
  export let disabled = false
  export let notNull = false
  export let defaultValue: any = notNull ? options[0].value : undefined
  export let conditional: boolean|undefined = undefined
  export let placeholder: string = 'Select' + (label ? ' ' + label : '')
  export let inputelement: HTMLSelectElement = undefined

  const colorsByValue = keyby(options, 'value')
</script>

<FieldStandard bind:id {path} {label} {required} {defaultValue} {conditional} let:id let:value let:valid let:invalid let:onBlur let:onChange>
  <div class="flex-color-container">
    <div class="selected-color" style="background-color: { value ? colorsByValue[value].color : 'transparent' }"/>
    <select bind:this={inputelement} {id} name={path} {disabled} class="dialog-input dialog-select {className}" on:change={onChange} on:blur={onBlur} class:valid class:invalid>
      {#if !notNull}<option value="" selected={!value}>{placeholder}</option>{/if}
      {#each options as option (option.value) }
        <option value={option.value} selected={value === option.value}>{option.name || option.value}</option>
      {/each}
    </select>
  </div>
</FieldStandard>

<style>
  .flex-color-container {
    display: flex;
    align-items: center;
  }
  .selected-color {
    height: 2em;
    width: 2em;
    margin-right: 1em;
    border: 1px solid #6d6d6d;
    border-radius: 3px;
  }
</style>