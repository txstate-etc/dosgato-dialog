<!-- @component
  A Field component for dynamically rendering checkbox choices accross the available width of a `<div>`. If there are more
  choices than the available width of the `<div>` will support then it will create multiple rows to render within using
  flex. Ordering is top down by default but can be order horizontally by toggling `leftToRight`.
  The value of the field will be an array corresponding to the values of the checkboxes that are checked.
-->
<script lang="ts">
  import { getContext } from 'svelte'
  import { Field, FORM_CONTEXT, arraySerialize, FORM_INHERITED_PATH } from '@txstate-mws/svelte-forms'
  import type { FormStore } from '@txstate-mws/svelte-forms'
  import { derivedStore } from '@txstate-mws/svelte-store'
  import { isNotBlank, randomid } from 'txstate-utils'
  import Container from './Container.svelte'
  import Checkbox from './Checkbox.svelte'
  import { getDescribedBy } from './helpers'

  let className = ''
  export { className as class }
  export let id: string | undefined = undefined
  export let path: string
  export let label = ''
  export let choices: { label?: string, value: any, disabled?: boolean }[] | undefined
  export let defaultValue: any = []
  export let conditional: boolean | undefined = undefined
  export let maxwidth = 250
  export let leftToRight = false
  export let related: true | number = 0
  export let extradescid: string | undefined = undefined
  export let helptext: string | undefined = undefined
  export let selectAll = false

  const store = getContext<FormStore>(FORM_CONTEXT)
  const inheritedPath = getContext<string>(FORM_INHERITED_PATH)
  const finalPath = [inheritedPath, path].filter(isNotBlank).join('.')
  const val = store.getField<any[]>(finalPath)
  const currentWidth = derivedStore(store, 'width')
  $: cols = Math.min(Math.ceil($currentWidth / maxwidth), choices?.length ?? 0)

  let orders: number[]
  let width = '100%'
  function redoLayout (..._: any) {
    width = `${100 / cols}%`
    const rows = Math.ceil((choices?.length ?? 0) / cols)
    orders = choices?.map((_, i) => leftToRight ? i : Math.floor((i + 1) / cols) + rows * (i % cols)) ?? []
  }
  $: redoLayout(choices, cols)

  function onChangeCheckbox (setVal: (val: any) => void, choice: NonNullable<typeof choices>[number], included: boolean) {
    setVal(v => {
      if (v == null) return included ? [] : [choice.value]
      if (included) return v.filter(s => s !== choice.value)
      else return [...v, choice.value]
    })
  }

  let selected = new Set<any>()
  function reactToValue (value: any[]) {
    selected = new Set(value ?? [])
  }
  $: reactToValue($val)

  let selectAllElement: HTMLInputElement | undefined
  const selectAllId = randomid()

  $: selectAllChecked = choices?.every(choice => choice.disabled || selected.has(choice.value)) ?? false

  function selectAllChanged () {
    if (selectAllChecked) {
      // it was checked and is now unchecked, clear it out
      void store.setField(finalPath, [])
    } else {
      // it was not checked and now it is checked
      void store.setField(finalPath, choices?.filter(choice => !choice.disabled).map(choice => choice.value) ?? [])
    }
  }

  const descid = randomid()
</script>

<Field {path} {defaultValue} allowedValues={choices?.map(choice => choice.value)} allowedValuesMultiple {conditional} let:path={fullpath} let:value let:onBlur let:setVal let:messages let:valid let:invalid serialize={arraySerialize}>
  <Container path={fullpath} {id} {label} {messages} {descid} {related} {helptext} let:messagesid let:helptextid>
    <div class="dialog-choices {className}" class:valid class:invalid>
      {#if selectAll}
        <label for={selectAllId} style:width>
          <Checkbox id={selectAllId} name={selectAllId} bind:inputelement={selectAllElement} value={selectAllChecked} onChange={selectAllChanged} />
          <span>Select All</span>
        </label>
      {/if}
      {#each choices as choice, idx (choice.value)}
        {@const checkid = `${fullpath}.${idx}`}
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
