<script lang="ts">
  import { nullableSerialize, nullableDeserialize } from '@txstate-mws/svelte-forms'
  import FieldStandard from './FieldStandard.svelte'
  import { randomid } from 'txstate-utils'
  import { PopupMenu, ScreenReaderOnly, type PopupMenuItem } from '@txstate-mws/svelte-components'
  export let id: string | undefined = undefined
  export let path: string
  export let label: string = ''
  export let placeholder: string = 'Select' + (label ? ' ' + label : '')
  let className = ''
  export { className as class }
  export let notNull = false
  export let disabled = false
  export let choices: { label?: string, value: string, disabled?: boolean }[]
  export let defaultValue: any = notNull ? choices[0].value : undefined
  export let conditional: boolean|undefined = undefined
  export let required = false
  export let helptext = ''

  let inputelement: HTMLInputElement
  let inputvalue = ''
  let popupvalue = undefined
  let savedLabel = ''
  let changed = false
  let menuid: string

  if (defaultValue) {
    const selected = choices.find(c => c.value === defaultValue)
    inputvalue = selected.label || selected.value
    savedLabel = inputvalue
  }

  const liveTextId = randomid()
  const helpTextId = randomid()

  $:filteredChoices = changed
    ? choices.filter((item: PopupMenuItem) => {
      return item.label?.toLowerCase().includes(inputvalue.toLowerCase()) || item.value.toLowerCase().includes(inputvalue.toLowerCase())
    })
    : choices

  function onchangepopup (setVal: any) {
    return (e) => {
      inputvalue = e.detail.label || e.detail.value
      savedLabel = inputvalue
      popupvalue = undefined
      setVal(e.detail.value)
      changed = false
    }
  }

  async function checkifchanged (e) {
    await setTimeout(function () {
      if (inputelement.value !== savedLabel) changed = true
    }, 1)
  }
</script>

<FieldStandard bind:id {label} {path} {required} {defaultValue} {conditional} serialize={!notNull && nullableSerialize} deserialize={!notNull && nullableDeserialize} let:setVal let:valid let:invalid let:id let:onBlur let:onChange let:messagesid>
  <input bind:this={inputelement} bind:value={inputvalue} {id} {placeholder} class="dialog-input {className}" class:valid class:invalid aria-invalid={invalid} aria-expanded={false} aria-controls={menuid} {onBlur} {onChange} autocapitalize="none" type="text" autocomplete="off" aria-autocomplete="list" role="combobox" {disabled} aria-describedby={`${messagesid ?? ''} ${helptext.length ? helpTextId : ''}`} on:keydown={checkifchanged}>
  <PopupMenu bind:menuid align="bottomleft" items={filteredChoices} buttonelement={inputelement} bind:value={popupvalue} on:change={onchangepopup(setVal)} emptyText="No options available"/>
  {#if helptext.length}
    <span id={helpTextId} class="field-help-text">{helptext}</span>
  {/if}
  <ScreenReaderOnly arialive="polite" ariaatomic={true} id={liveTextId}>
    {filteredChoices.length} {filteredChoices.length === 1 ? 'option' : 'options'} available.
  </ScreenReaderOnly>
</FieldStandard>
