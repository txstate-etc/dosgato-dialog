<script lang="ts">
  import { getContext } from 'svelte'
  import { Field, FORM_CONTEXT } from '@txstate-mws/svelte-forms'
  import type { FormStore } from '@txstate-mws/svelte-forms'
  import { derivedStore } from '@txstate-mws/svelte-store'
  import { randomid } from 'txstate-utils'
  import Container from './Container.svelte'
  import Checkbox from './Checkbox.svelte'
  import { getDescribedBy } from './helpers'

  let className = ''
  export { className as class }
  export let id: string|undefined = undefined
  export let path: string
  export let label: string = ''
  export let choices: { label?: string, value: any, disabled?: boolean }[]
  export let defaultValue: any = []
  export let conditional: boolean|undefined = undefined
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

  function onChangeCheckbox (setVal: Function, choice: typeof choices[number], included: boolean) {
    setVal(v => {
      if (v == null) return included ? [] : [choice.value]
      if (included) return v.filter(s => s !== choice.value)
      else return [...v, choice.value]
    })
  }

  const descid = randomid()
</script>

<Field {path} {defaultValue} {conditional} let:path let:value let:onBlur let:setVal let:messages let:valid let:invalid>
  <Container {id} {label} {messages} {descid} {related} {helptext} let:messagesid let:helptextid>
    <div class="dialog-choices {className}" class:valid class:invalid>
      {#each choices as choice, idx}
        {@const checkid = `${path}.${idx}`}
        {@const included = value && value.includes(choice.value)}
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
