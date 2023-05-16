<script lang="ts">
  import { nullableSerialize, nullableDeserialize } from '@txstate-mws/svelte-forms'
  import FieldStandard from './FieldStandard.svelte'
  import { isBlank, isNotBlank, randomid } from 'txstate-utils'
  import { modifierKey, PopupMenu, ScreenReaderOnly, type PopupMenuItem } from '@txstate-mws/svelte-components'
  import { getDescribedBy } from '$lib'
  import { onMount } from 'svelte'
  export let id: string | undefined = undefined
  export let path: string
  export let label: string = ''
  export let placeholder: string = 'Select' + (label ? ' ' + label : '')
  let className = ''
  export { className as class }
  export let notNull = false
  export let disabled = false
  export let choices: { label?: string, value: string, disabled?: boolean }[]
  export let defaultValue: string | undefined = undefined
  export let conditional: boolean|undefined = undefined
  export let required = false
  export let inputelement: HTMLInputElement = undefined as any
  export let related: true | number = 0
  export let extradescid: string | undefined = undefined
  export let helptext: string | undefined = undefined

  let inputvalue = ''
  let popupvalue = undefined
  let menuid: string

  const liveTextId = randomid()
  $: finalserialize = !notNull ? nullableSerialize : v => v
  $: finaldeserialize = !notNull ? nullableDeserialize : v => v

  $: valueToLabel = Object.fromEntries(choices.map(c => [c.value, c.label || c.value]))
  $: labelToValue = Object.fromEntries(choices.map(c => [c.label || c.value, c.value]))
  $: filteredChoices = choices.filter((item: PopupMenuItem) => {
    return item.label?.toLowerCase().includes(inputvalue.toLowerCase()) || item.value.toLowerCase().includes(inputvalue.toLowerCase())
  })

  let menushown = false
  let savedVal = defaultValue
  function onKeyUp (setVal: any) {
    return (e) => {
      if (!modifierKey(e)) {
        const val = labelToValue[inputvalue.trim()]
        menushown = !val
        // we need to make sure the form state stays up to date with what's shown in the text field
        // if the text field has only a substring of a valid label the form state value should remain
        // empty, but once the text field has a valid label the form state should be updated
        if (savedVal !== val) {
          savedVal = val
          setVal(val)
        }
      }
    }
  }

  function onchangepopup (setVal: any) {
    return (e) => {
      inputvalue = e.detail.label || e.detail.value
      popupvalue = undefined
      savedVal = e.detail.value
      setVal(e.detail.value)
    }
  }


  function reactToValue (value: string, setVal: any) {
    const dsvalue = finaldeserialize(value)
    if (dsvalue !== savedVal) {
      const label = valueToLabel[dsvalue]

      // if the form state value changes from the outside we need to replace the text field content
      // with the new label
      // if the new form state value is undefined, we should let them keep any half-finished typing they
      // might have in the field, but if they have a fully valid entry in the field, it needs to disappear
      // to reflect the new reality that the form value has gone away
      if (label != null || (savedVal && valueToLabel[savedVal])) inputvalue = label ?? ''

      savedVal = dsvalue
      // if the form state value changes from the outside to an invalid value, we have to clear it out
      if (isNotBlank(dsvalue) && isBlank(label)) setVal(finaldeserialize(''))
    }
  }
</script>

<FieldStandard bind:id {label} {path} {required} {defaultValue} {conditional} {related} {helptext} serialize={finalserialize} deserialize={finaldeserialize} let:value let:setVal let:valid let:invalid let:id let:onBlur let:messagesid let:helptextid>
  {@const _ = reactToValue(value, setVal)}
  <input bind:this={inputelement} bind:value={inputvalue} {id} {placeholder} class="dialog-input {className}" class:valid class:invalid aria-invalid={invalid} aria-expanded={false} aria-controls={menuid} on:blur={onBlur} on:keyup={onKeyUp(setVal)} autocapitalize="none" type="text" autocomplete="off" aria-autocomplete="list" role="combobox" {disabled} aria-describedby={getDescribedBy([messagesid, helptextid, extradescid])}>
  <PopupMenu bind:menushown bind:menuid align="bottomleft" items={filteredChoices} buttonelement={inputelement} bind:value={popupvalue} on:change={onchangepopup(setVal)} emptyText="No options available"/>
  <ScreenReaderOnly arialive="polite" ariaatomic={true} id={liveTextId}>
    {filteredChoices.length} {filteredChoices.length === 1 ? 'option' : 'options'} available.
  </ScreenReaderOnly>
</FieldStandard>
