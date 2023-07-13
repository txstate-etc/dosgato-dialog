<!-- @component
  The purpose of FieldMultiselect is to provide a Field with text input having a popup menu
  that displays, or completes, choice selections based on what's been typed in the text input.
  Selected choices will be added to a list of selected items, in a pill format, that provides
  a means for tracking and removing existing selections. The choices listed in the popup are
  controlled by the parent component via the `getOptions` function that will be used as a
  debounced callback on the contents of the text input.
-->
<script lang="ts">
  import { MultiSelect } from '@txstate-mws/svelte-components'
  import type { PopupMenuItem } from '@txstate-mws/svelte-components'
  import { arraySerialize } from '@txstate-mws/svelte-forms'
  import { Store } from '@txstate-mws/svelte-store'
  import { onMount } from 'svelte'
  import { isNotBlank } from 'txstate-utils'
  import FieldStandard from './FieldStandard.svelte'
  import { getDescribedBy } from './helpers'

  export let path: string
  /** Function to pass to the component that tells it how to use the text
  in the text input to determine what `PopupMenuItem[]` should be displayed
  in the `<PopupMenu>`. Items already 'selected' from the popup menu will be
  tracked and automatically filtered from the popup if returned as one of the
  `PopupMenuItem[]` by `getOptions`. */
  export let getOptions: (search: string) => Promise<PopupMenuItem[]>
  export let id: string | undefined = undefined
  export let label: string = ''
  /** Text to display in the text input when it's empty. */
  export let placeholder = ''
  export let disabled = false
  export let defaultValue: string[] = []
  export let conditional: boolean|undefined = undefined
  export let required = false
  /** Max number of selections to be allowed before disabling the input - 0 for unlimited. */
  export let maxSelections = 0
  export let lookupByValue: (val: string) => Promise<PopupMenuItem | undefined> = async (val) => { const options = await getOptions(val); return options.find((opt) => opt.value === val) }
  export let related: true | number = 0
  export let extradescid: string | undefined = undefined
  export let helptext: string | undefined = undefined

  /** Each time we run getOptions we will save the value -> label mappings that it finds, so that we can display labels on pills. */
  const valueToLabel: Record<string, string> = {}

  async function wrapGetOptions (search: string) {
    const opts = await getOptions(search)
    /* If no options are returned with the search term, we can end up with an infinite loop the first time reactToValue calls wrapGetOptions */
    // if (opts.length === 0) opts = await getOptions('')
    for (const opt of opts) {
      valueToLabel[opt.value] = opt.label || opt.value
    }
    return opts
  }

  const selectedStore = new Store<{ value: string, label: string }[]>([])
  let hasInit = !defaultValue.length

  let inputelement: HTMLElement
  onMount(async () => {
    await reactToValue(defaultValue)
    hasInit = true
  })

  /**
  If we get a value from the form that we haven't seen in the popup menu yet, we won't have a label for it.
  This function runs getOptions on any selected values for which the label is currently unknown. */
  async function reactToValue (value: string[]) {
    await Promise.all(value.map(async v => {
      if (!valueToLabel[v]) {
        const item = await lookupByValue(v)
        if (item) valueToLabel[item.value] = item.label ?? item.value
      }
    }))
    selectedStore.set(value.map(v => ({ value: v, label: valueToLabel[v] })).filter(v => isNotBlank(v.label)))
  }
</script>

<div bind:this={inputelement}></div>
{#if hasInit}
  <FieldStandard bind:id {label} {path} {required} {defaultValue} {conditional} {related} {helptext} let:value let:valid let:invalid let:id let:onBlur let:setVal let:messagesid let:helptextid serialize={arraySerialize}>
    {@const _ = reactToValue(value)}
    <div class:valid class:invalid>
      <MultiSelect {id} name={path} descid={getDescribedBy([messagesid, helptextid, extradescid])}
        {disabled} {maxSelections} selected={$selectedStore} {placeholder} getOptions={wrapGetOptions}
        inputClass='multiselect-input'
        on:change={e => setVal(e.detail.map(itm => itm.value))} on:blur={onBlur}
      />
    </div>
  </FieldStandard>
{/if}

<style>
  .invalid {
    --multiselect-border: 1px solid red;
  }
  :global(.multiselect-input) {
    width: 100%
  }
</style>
