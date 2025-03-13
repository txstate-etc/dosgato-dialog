<script lang="ts">
  import { datetimeSerialize, datetimeDeserialize } from '@txstate-mws/svelte-forms'
  import FieldStandard from './FieldStandard.svelte'
  import Input from './Input.svelte'
  import { createEventDispatcher } from 'svelte'
  let className = ''
  export { className as class }
  export let id: string | undefined = undefined
  export let path: string
  export let label: string = ''
  export let defaultValue: any = undefined
  export let min: Date | { toJSDate: () => Date } | undefined = undefined
  export let max: Date | { toJSDate: () => Date } | undefined = undefined
  export let step: number | undefined = undefined
  export let conditional: boolean | undefined = undefined
  export let required = false
  export let related: true | number = 0
  export let extradescid: string | undefined = undefined
  export let helptext: string | undefined = undefined
  export let inputelement: HTMLInputElement = undefined!

  const dispatch = createEventDispatcher()

  function onChange (setVal) {
    return () => {
      if (inputelement) {
        const date = new Date(inputelement.value)
        const invalid = inputelement.validity.badInput || !(date instanceof Date && !isNaN(date.valueOf()))
        if (invalid) {
          setVal(undefined)
          dispatch('change', undefined)
        } else {
          setVal(datetimeDeserialize(inputelement.value))
          dispatch('change', datetimeDeserialize(inputelement.value))
        }
      }
    }
  }
</script>

<FieldStandard bind:id {label} {path} {required} {defaultValue} {conditional} {related} {helptext} serialize={datetimeSerialize} deserialize={datetimeDeserialize} let:value let:valid let:invalid let:id let:onBlur let:helptextid let:messagesid let:setVal>
  <Input bind:inputelement={inputelement} type="datetime-local" name={path} {value} {id} class="dialog-input {className}" {onBlur} onChange={onChange(setVal)} {valid} {invalid} {min} {max} {step} {extradescid} {messagesid} {helptextid}/>
</FieldStandard>

