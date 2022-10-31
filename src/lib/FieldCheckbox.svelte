<script lang="ts">
  import { randomid } from 'txstate-utils'
  import FieldStandard from './FieldStandard.svelte'
  import Checkbox from './Checkbox.svelte'
  let className = ''
  export { className as class }
  export let id: string | undefined = undefined
  export let path: string
  export let label: string = ''
  export let boxLabel: string
  export let defaultValue: boolean|undefined = undefined
  export let conditional: boolean|undefined = undefined
  export let required = false
  export let inputelement: HTMLInputElement = undefined
  export let helptext: string | undefined = undefined

  function onChange (setVal: Function) {
    return function () {
      setVal(this.checked)
    }
  }

  const descid = randomid()
</script>

<FieldStandard bind:id {path} {descid} {label} {defaultValue} {conditional} {helptext} {required} let:value let:messagesid let:helptextid let:valid let:invalid let:id let:onBlur let:setVal>
  <div class={className}>
    <label for={id}>
      <Checkbox bind:inputelement {id} name={path} {value} {messagesid} {helptextid} {descid} {valid} {invalid} {onBlur} onChange={onChange(setVal)}></Checkbox>
      <span>{boxLabel}</span>
    </label>
  </div>
</FieldStandard>
