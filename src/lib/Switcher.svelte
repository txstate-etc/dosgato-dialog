<script lang="ts">
  import { eq } from '@txstate-mws/svelte-components'
  import type { Feedback } from '@txstate-mws/svelte-forms'
  import { Store } from '@txstate-mws/svelte-store'
  import { createEventDispatcher } from 'svelte'
  import { randomid } from 'txstate-utils'
  import Container from './Container.svelte'
  import Radio from './Radio.svelte'
  let className = ''
  export { className as class }
  export let id: string | undefined = randomid()
  export let name = randomid()
  export let choices: { label?: string, value: string, disabled?: boolean }[]
  export let horizontal = false
  export let label: string
  export let required = false
  export let related: true | number = 0
  export let extradescid: string | undefined = undefined
  export let helptext: string | undefined = undefined
  export let messages: Feedback[] = []
  export let iptValue = choices[0].value
  export let valid = false
  export let invalid = false
  export let onBlur: (() => void | Promise<void>) | undefined = undefined

  const dispatch = createEventDispatcher()
  const store = new Store({ width: 1000 })

  const groupid = randomid()
  function onChange (e: InputEvent) {
    iptValue = this.value
    dispatch('change', iptValue)
  }

  $: columns = Math.floor($store.width / 250)
  $: width = (horizontal ? 100 / Math.min(choices.length, choices.length === 4 && columns === 3 ? 2 : columns) : 100) + '%'
</script>
<Container {id} {label} {messages} descid={groupid} {required} {related} {helptext} let:helptextid>
  <div class="dialog-radio {className}" use:eq={{ store }} class:horizontal role="radiogroup" aria-labelledby={groupid} class:valid class:invalid>
    {#each choices as choice, idx}
      {@const radioid = `${groupid}.${idx}`}
      <label for={radioid} style:width>
        <Radio id={radioid} {name} value={choice.value} selected={iptValue === choice.value} disabled={choice.disabled} {onChange} {onBlur} {helptextid} {extradescid} />
        <span>{choice.label || choice.value}</span>
      </label>
    {/each}
  </div>
</Container>

<style>
  .dialog-radio {
    padding: 0.2em 0;
  }
  label {
    margin-bottom: 0.7em;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    cursor: pointer;
    width: 25%;
  }
  .dialog-radio:not(.horizontal) label:last-child {
    margin-bottom: 0;
  }
  span {
    margin-left: 0.45em;
    max-width: calc(100% - 1.6em);
  }
  .horizontal {
    display: flex;
    flex-wrap: wrap;
  }
</style>
