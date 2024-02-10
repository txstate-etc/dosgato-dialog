<script lang="ts">
  import { type FormStore, FORM_CONTEXT, FORM_INHERITED_PATH } from '@txstate-mws/svelte-forms'
  import { getContext, onMount } from 'svelte'
  import { isNotBlank, get } from 'txstate-utils'
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
  export let choices: { label?: string, value: any, disabled?: boolean }[]
  export let defaultValue: any = notNull ? choices[0]?.value : undefined
  export let conditional: boolean | undefined = undefined
  export let required = false
  export let inputelement: HTMLSelectElement = undefined as any
  export let related: true | number = 0
  export let extradescid: string | undefined = undefined
  export let helptext: string | undefined = undefined
  export let number = false
  export let date = false
  export let datetime = false
  export let boolean = false
  export let serialize: ((value: any) => string) | undefined = undefined
  export let deserialize: ((value: string) => any) | undefined = undefined

  const store = getContext<FormStore>(FORM_CONTEXT)
  const inheritedPath = getContext<string>(FORM_INHERITED_PATH)
  const finalPath = [inheritedPath, path].filter(isNotBlank).join('.')

  let finalDeserialize: (value: string) => any
  function updateDeserialize (fDes: any) {
    finalDeserialize = fDes
  }
  async function reactToChoices (..._: any[]) {
    if (!choices.length) {
      return await store.setField(finalPath, finalDeserialize(''))
    }
    const val = get($store, finalPath)
    if (!choices.some(o => o.value === finalDeserialize(val))) await store.setField(finalPath, notNull ? defaultValue : finalDeserialize(''))
  }
  $: reactToChoices(choices).catch(console.error)
  onMount(reactToChoices)
</script>

<FieldStandard bind:id {label} {path} {required} {defaultValue} {conditional} {related} {helptext} {notNull} {number} {date} {datetime} {boolean} {serialize} {deserialize} let:value let:valid let:invalid let:id let:onBlur let:onChange let:messagesid let:helptextid let:serialize let:deserialize>
  {@const _ = updateDeserialize(deserialize)}
  <select bind:this={inputelement} {id} name={path} {disabled} class="dialog-input dialog-select {className}" on:change={onChange} on:blur={onBlur} class:valid class:invalid aria-describedby={getDescribedBy([messagesid, helptextid, extradescid])}>
    {#if !notNull}<option value="" selected={!value}>{placeholder}</option>{/if}
    {#each choices as choice (choice.value)}
      {@const serializedValue = serialize(choice.value)}
      <option value={serializedValue} disabled={choice.disabled} selected={value === serializedValue}>{choice.label || serializedValue}</option>
    {/each}
  </select>
</FieldStandard>

<style>
  select {
    color: black;
  }
</style>
