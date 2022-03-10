<script lang="ts">
  import FieldStandard from './FieldStandard.svelte'
  import Checkbox from './Checkbox.svelte'
  let className = ''
  export { className as class }
  export let id: string | undefined = undefined
  export let path: string
  export let label: string = ''
  export let boxLabel
  export let defaultValue: boolean|undefined = undefined
  export let conditional: boolean|undefined = undefined
  export let required = false

  function setCheckboxValue(setVal: Function) {
    setVal(v => {
      return !v
    })
  }
</script>

<FieldStandard bind:id {path} {label} {defaultValue} {conditional} {required} let:value let:valid let:invalid let:id let:onBlur let:setVal>
  <div class={className}>
    <label for={id}>
      <Checkbox {id} name={path} {value} {valid} {invalid} {onBlur} onChange={() => setCheckboxValue(setVal)}></Checkbox>
      <span>{boxLabel}</span>
    </label>
  </div>
</FieldStandard>