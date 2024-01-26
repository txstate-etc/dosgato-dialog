<!-- @component
  A Field component for dynamically rendering checkbox choices accross the available width of a `<div>`. If there are more
  choices than the available width of the `<div>` will support then it will create multiple rows to render within using
  flex. Ordering is top down by default but can be order horizontally by toggling `leftToRight`.
  The value of the field will be an array corresponding to the values of the checkboxes that are checked.
-->
<script lang="ts">
  import { getContext, onMount } from 'svelte'
  import { Field, FORM_CONTEXT, arraySerialize } from '@txstate-mws/svelte-forms'
  import type { FormStore } from '@txstate-mws/svelte-forms'
  import { derivedStore } from '@txstate-mws/svelte-store'
  import { randomid } from 'txstate-utils'
  import Container from './Container.svelte'
  import Checkbox from './Checkbox.svelte'
  import { getDescribedBy } from './helpers'

  let className = ''
  export { className as class }
  export let id: string | undefined = undefined
  export let path: string
  export let label: string = ''
  export let choices: { label?: string, value: any, disabled?: boolean }[]
  export let defaultValue: any = []
  export let conditional: boolean | undefined = undefined
  export let maxwidth = 250
  export let leftToRight = false
  export let related: true | number = 0
  export let extradescid: string | undefined = undefined
  export let helptext: string | undefined = undefined

  const store = getContext<FormStore>(FORM_CONTEXT)
  const currentWidth = derivedStore(store, 'width')
  $: cols = Math.min(Math.ceil($currentWidth / maxwidth), choices.length)

  let orders: number[]
  let width = '100%'
  function redoLayout (..._: any) {
    width = `${100 / cols}%`
    const rows = Math.ceil(choices.length / cols)
    orders = choices.map((_, i) => leftToRight ? i : Math.floor((i + 1) / cols) + rows * (i % cols))
  }
  $: redoLayout(choices, cols)

  function onChangeCheckbox (setVal: (val: any) => void, choice: typeof choices[number], included: boolean) {
    setVal(v => {
      if (v == null) return included ? [] : [choice.value]
      if (included) return v.filter(s => s !== choice.value)
      else return [...v, choice.value]
    })
  }

  const descid = randomid()

  let val: any, stVal: (val: any, notDirty?: boolean) => void
  function updateValue (valu: any, sVal: any) {
    val = valu
    stVal = sVal
  }
  function reactToChoices (..._: any[]) {
    if (!stVal) return
    const choiceSet = new Set(choices?.map(c => c.value))
    const filtered = val?.filter(v => choiceSet.has(v))
    if (filtered?.length !== val?.length) stVal(filtered, true)
  }
  $: reactToChoices(choices)
  onMount(reactToChoices)
</script>

<Field {path} {defaultValue} {conditional} let:path let:value let:onBlur let:setVal let:messages let:valid let:invalid serialize={arraySerialize}>
  {@const _ = updateValue(value, setVal)}
  <Container {path} {id} {label} {messages} {descid} {related} {helptext} let:messagesid let:helptextid>
    <div class="dialog-choices {className}" class:valid class:invalid>
      {#each choices as choice, idx (choice.value)}
        {@const checkid = `${path}.${idx}`}
        {@const included = value?.includes(choice.value)}
        {@const label = choice.label || (typeof choice.value === 'string' ? choice.value : '')}
        <label for={checkid} style:width style:order={orders[idx]}>
          <Checkbox id={checkid} name={checkid} value={included} descid={getDescribedBy([descid, messagesid, helptextid, extradescid])} disabled={choice.disabled} onChange={() => onChangeCheckbox(setVal, choice, included)} {onBlur} />
          <span>{label}</span>
        </label>
      {/each}
    </div>
  </Container>
</Field>

<style>
  .dialog-choices {
    display: flex;
    flex-wrap: wrap;
  }
  label {
    margin-bottom: 0.7em;
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }
  span {
    margin-left: 0.45em;
    max-width: calc(100% - 1.6em);
  }
  label :global(input[type="checkbox"]) {
    transform: none;
  }
</style>
