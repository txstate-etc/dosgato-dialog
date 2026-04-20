<script lang="ts">
  import { modifierKey, PopupMenu, ScreenReaderOnly, type PopupMenuItem } from '@txstate-mws/svelte-components'
  import { FORM_CONTEXT, FORM_INHERITED_PATH, type FormStore } from '@txstate-mws/svelte-forms'
  import { isNotBlank, randomid } from 'txstate-utils'
  import { getDescribedBy } from '$lib'
  import FieldStandard from './FieldStandard.svelte'
  import { getContext } from 'svelte'

  export let id: string | undefined = undefined
  export let path: string
  export let label = ''
  export let placeholder: string = 'Select' + (label ? ' ' + label : '')
  let className = ''
  export { className as class }
  export let notNull = false
  export let disabled = false
  export let choices: { label?: string, value: string, disabled?: boolean }[] | undefined
  export let defaultValue: string | undefined = undefined
  export let conditional: boolean | undefined = undefined
  export let required = false
  export let inputelement: HTMLInputElement = undefined as any
  export let related: true | number = 0
  export let extradescid: string | undefined = undefined
  export let helptext: string | undefined = undefined

  let inputvalue = ''
  let popupvalue = undefined
  let menuid: string

  const liveTextId = randomid()
  let finalDeserialize: (value: string) => any

  const store = getContext<FormStore>(FORM_CONTEXT)
  const inheritedPath = getContext<string>(FORM_INHERITED_PATH)
  const finalPath = [inheritedPath, path].filter(isNotBlank).join('.')
  const val = store.getField<string>(finalPath)

  $: valueToLabel = Object.fromEntries(choices?.map(c => [c.value, c.label || c.value]) ?? [])
  $: labelToValue = Object.fromEntries(choices?.map(c => [c.label || c.value, c.value]) ?? [])
  $: filteredChoices = choices?.filter((item: PopupMenuItem) => item.label?.toLowerCase().includes(inputvalue.toLowerCase()) || item.value.toLowerCase().includes(inputvalue.toLowerCase())) ?? []

  let menushown = false
  let savedVal = defaultValue
  function onKeyUp (setVal: any) {
    return e => {
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
    return e => {
      inputvalue = e.detail.label || e.detail.value
      popupvalue = undefined
      savedVal = e.detail.value
      setVal(e.detail.value)
    }
  }

  async function reactToValue (value: string, ..._: any[]) {
    if (!finalDeserialize) return
    const dsvalue = finalDeserialize(value)
    if (dsvalue !== savedVal) {
      const label = valueToLabel[dsvalue]
      // if the new form state value is undefined and they were just typing (no prior valid selection),
      // let them keep their half-finished input; otherwise update to reflect the new value
      if (label != null || savedVal) inputvalue = label ?? ''

      savedVal = dsvalue
    }
  }
  $: reactToValue($val, finalDeserialize, valueToLabel).catch(console.error)
</script>

<FieldStandard bind:id allowedValues={choices?.map(c => c.value)} {label} {path} {required} {defaultValue} {conditional} {related} {helptext} {notNull} bind:finalDeserialize let:setVal let:valid let:invalid let:id={fieldid} let:onBlur let:messagesid let:helptextid let:value>
  <input bind:this={inputelement} bind:value={inputvalue} id={fieldid} {placeholder} class="dialog-input {className}" class:valid class:invalid aria-invalid={invalid} aria-expanded={false} aria-controls={menuid} on:blur={onBlur} on:keyup={onKeyUp(setVal)} autocapitalize="none" type="text" autocomplete="off" aria-autocomplete="list" role="combobox" {disabled} aria-describedby={getDescribedBy([messagesid, helptextid, extradescid])}>
  <PopupMenu bind:menushown bind:menuid align="bottomleft" items={filteredChoices} buttonelement={inputelement} bind:value={popupvalue} on:change={onchangepopup(setVal)} emptyText="No options available"/>
  <ScreenReaderOnly arialive="polite" ariaatomic={true} id={liveTextId}>
    {filteredChoices.length} {filteredChoices.length === 1 ? 'option' : 'options'} available.
  </ScreenReaderOnly>
</FieldStandard>
