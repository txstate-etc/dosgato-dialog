<!-- @component
  A Field component for dynamically rendering checkbox choices accross the available width of a `<div>`. If there are more
  choices than the available width of the `<div>` will support then it will create multiple rows to render within using
  flex. Ordering is top down by default but can be order horizontally by toggling `leftToRight`.
  The value of the field will be an array corresponding to the values of the checkboxes that are checked.
-->
<script lang="ts">
  import { getContext, onMount } from 'svelte'
  import { Field, FORM_CONTEXT, arraySerialize, FORM_INHERITED_PATH } from '@txstate-mws/svelte-forms'
  import type { FormStore } from '@txstate-mws/svelte-forms'
  import { derivedStore } from '@txstate-mws/svelte-store'
  import { get, isNotBlank, randomid } from 'txstate-utils'
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
  export let selectAll: boolean = false

  const store = getContext<FormStore>(FORM_CONTEXT)
  const inheritedPath = getContext<string>(FORM_INHERITED_PATH)
  const finalPath = [inheritedPath, path].filter(isNotBlank).join('.')
  const valStore = store.getField<any[]>(finalPath)
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

  $: selected = new Set($valStore ?? [])

  let selectAllElement: HTMLInputElement | undefined
  const selectAllId = randomid()

  $: selectAllChecked = choices.every(choice => choice.disabled || selected.has(choice.value))

  function selectAllChanged () {
    if (selectAllChecked) {
      // it was checked and is now unchecked, clear it out
      void store.setField(finalPath, [])
    } else {
      // it was not checked and now it is checked
      void store.setField(finalPath, choices.filter(choice => !choice.disabled).map(choice => choice.value))
    }
  }

  const descid = randomid()

  function reactToChoices (..._: any[]) {
    const choiceSet = new Set(choices?.filter(c => !c.disabled).map(c => c.value))
    selected = new Set(Array.from(selected).filter(v => choiceSet.has(v)))
    const val = get($store.data, finalPath)
    const filtered = val?.filter(v => choiceSet.has(v))
    if (filtered?.length !== val?.length) store.setField(finalPath, filtered).catch(console.error)
  }
  $: reactToChoices(choices)
  onMount(reactToChoices)
</script>

<Field {path} {defaultValue} {conditional} let:path let:value let:onBlur let:setVal let:messages let:valid let:invalid serialize={arraySerialize}>
  <Container {path} {id} {label} {messages} {descid} {related} {helptext} let:messagesid let:helptextid>
    <div class="dialog-choices {className}" class:valid class:invalid>
      {#if selectAll}
        <label for={selectAllId} style:width>
          <Checkbox id={selectAllId} name={selectAllId} bind:inputelement={selectAllElement} value={selectAllChecked} onChange={selectAllChanged} />
          <span>Select All</span>
        </label>
      {/if}
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
