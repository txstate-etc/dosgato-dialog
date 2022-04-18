<script lang="ts">
  import menuRight from '@iconify-icons/mdi/menu-right.js'
  import menuLeft from '@iconify-icons/mdi/menu-left.js'
  import FieldStandard from './FieldStandard.svelte'
  import { type PopupMenuItem, ScreenReaderOnly, modifierKey } from '@txstate-mws/svelte-components'
  import Icon from './Icon.svelte'
  import Listbox from './Listbox.svelte'
  import { randomid } from 'txstate-utils'
  export let id: string | undefined = undefined
  export let path: string
  export let label: string = ''
  export let sourceLabel: string = 'Available'
  export let selectedLabel: string = 'Selected'
  export let multiselect: boolean = false
  export let choices: PopupMenuItem[]
  export let defaultValue: string[] = []
  export let conditional: boolean|undefined = undefined
  export let required = false

  let itemsToAdd: PopupMenuItem[] = [] //the items selected in the left listbox
  let itemsToRemove: PopupMenuItem[] = [] //the items selected in the right listbox
  let instructions: String = 'test'

  $: {
    if (itemsToAdd.length === 1) instructions = `Press right arrow key to move selected ${sourceLabel} items to ${selectedLabel} items list.`
    else instructions = ''
  }

  $: {
    if (itemsToRemove.length === 1) instructions = `Press left arrow key to move selected ${selectedLabel} items to ${sourceLabel} list.`
    else instructions = ''
  }

  const descid = randomid()

  function addToSelected (value: string[], setVal: Function) {
    return () => {
      const selected = value.concat(itemsToAdd.map(item => item.value))
      itemsToAdd = []
      setVal(selected)
    }
  }

  function addToAvailable (value: string[], setVal: Function) {
    return () => {
      const itemsToRemoveSet = new Set(itemsToRemove.map(i => i.value))
      const selected = value.filter(v => !itemsToRemoveSet.has(v))
      itemsToRemove = []
      setVal(selected)
    }
  }

  let valueToLabel: Record<string, string> = {}
  for (const choice of choices) {
    valueToLabel[choice.value] = choice.label || choice.value
  }

  function valueToSelectedChoices (value: string[]) {
    // keep the selected options ordered as they were in the available options
    const valueSet = new Set(value)
    const ret = []
    for (const choice of choices) {
      if (valueSet.has(choice.value)) ret.push({ value: choice.value, label: choice.label || choice.value })
    }
    return ret
  }

  function getAvailable (value: string[]) {
    return choices.filter(choice => value.indexOf(choice.value) === -1)
  }

  function onkeydown (value: string[], setVal: Function) {
    return (e) => {
      if (modifierKey(e)) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        if (itemsToAdd.length === 0) return
        addToSelected(value, setVal)()
      } else if (e.key === 'ArrowLeft') {
          e.preventDefault()
          if (itemsToRemove.length === 0) return
          addToAvailable(value, setVal)()
      }
    }
  }
</script>

<FieldStandard bind:id {label} {path} {required} {defaultValue} {conditional} {descid} let:value let:valid let:invalid let:id let:onBlur let:onChange let:setVal>
  <div {id} role="group" class="dual-list-container" on:keydown={onkeydown(value, setVal)}>
    <ScreenReaderOnly>
      <span aria-live="polite">{instructions}</span>
    </ScreenReaderOnly>
    <Listbox label={sourceLabel} multiselect={multiselect} items={getAvailable(value)} {descid} {valid} {invalid} on:change={e => itemsToAdd = e.detail} selected={itemsToAdd}/>
    <div class="toolbar">
      <button type="button" class="toolbar-button" title="Move selection to {selectedLabel}" disabled={itemsToAdd.length === 0} on:click={addToSelected(value, setVal)}>
        <Icon icon={menuRight} width='3em'/>
      </button>
      <button type="button" class="toolbar-button" title="Remove selection from {selectedLabel}" disabled={itemsToRemove.length === 0} on:click={addToAvailable(value, setVal)}>
        <Icon icon={menuLeft} width='3em'/>
      </button>
    </div>
    <Listbox label={selectedLabel} multiselect={multiselect} items={valueToSelectedChoices(value)} {descid} {valid} {invalid}todo on:change={e => itemsToRemove = e.detail} selected={itemsToRemove}/>
  </div>
</FieldStandard>

<style>
  .dual-list-container {
    display: flex;
  }
  .toolbar {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .toolbar .toolbar-button {
    background-color: transparent;
    border: 0;
    padding: 0;
  }
</style>