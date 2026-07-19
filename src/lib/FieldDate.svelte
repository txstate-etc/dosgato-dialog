<script lang="ts">
  import { dateSerialize, dateDeserialize } from '@txstate-mws/svelte-forms'
  import FieldStandard from './FieldStandard.svelte'
  import Input from './Input.svelte'
  let className = ''
  export { className as class }
  export let id: string | undefined = undefined
  export let path: string
  export let label = ''
  export let defaultValue: any = undefined
  export let min: Date | { toJSDate: () => Date } | undefined = undefined
  export let max: Date | { toJSDate: () => Date } | undefined = undefined
  export let step: number | undefined = undefined
  export let conditional: boolean | undefined = undefined
  export let required = false
  export let clearable = false
  export let inputelement: HTMLInputElement = undefined as any
  export let related: true | number = 0
  export let extradescid: string | undefined = undefined
  export let helptext: string | undefined = undefined
  /** Record the date at the beginning of the day (00:00:00.000) instead of noon.
  Useful for date range queries that should include all records from the start of the
  selected date. Takes precedence over endOfDay if both are set. */
  export let beginningOfDay = false
  /** Record the date at the end of the day (23:59:59.999) instead of noon.
  Useful for date range queries that should include all records until the end of the
  selected date. */
  export let endOfDay = false

  function deserialize (v: string) {
    const dt = dateDeserialize(v)
    if (dt != null) {
      if (beginningOfDay) dt.setHours(0, 0, 0, 0)
      else if (endOfDay) dt.setHours(23, 59, 59, 999)
    }
    return dt
  }

  function onClear () {
    if (inputelement) inputelement.value = ''
  }
</script>

<FieldStandard bind:id {label} {path} {required} {defaultValue} {conditional} {related} {helptext} {clearable} serialize={dateSerialize} {deserialize} on:clear={onClear} let:value let:valid let:invalid let:id={fieldid} let:onBlur let:onChange let:messagesid let:helptextid>
  <Input bind:inputelement type="date" name={path} {value} id={fieldid} class="dialog-input {className}" {onChange} {onBlur} on:input={onChange} {valid} {invalid} {min} {max} {step} {extradescid} {messagesid} {helptextid}/>
</FieldStandard>
