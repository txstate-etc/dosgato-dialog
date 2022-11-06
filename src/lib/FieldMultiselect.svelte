<script lang="ts">
  import { MultiSelect } from '@txstate-mws/svelte-components'
  import type { PopupMenuItem } from '@txstate-mws/svelte-components'
  import FieldStandard from './FieldStandard.svelte'

  export let id: string | undefined = undefined
  export let path: string
  export let label: string = ''
  export let placeholder = ''
  export let disabled = false
  export let defaultValue: string[] = []
  export let conditional: boolean|undefined = undefined
  export let required = false
  export let getOptions: (search: string) => Promise<PopupMenuItem[]>

  // each time we run getOptions we will save the value -> label mappings
  // that it finds, so that we can display labels on pills
  let valueToLabel: Record<string, string> = {}

  async function wrapGetOptions (search: string) {
    let opts = await getOptions(search)
    // if no options are returned with the search term, we can end up with an infinite loop
    // the first time reactToValue calls wrapGetOptions
    if (opts.length === 0) {
      opts = await getOptions('')
    }
    let changed = false
    for (const opt of opts) {
      if (valueToLabel[opt.value] !== opt.label || opt.value) {
        valueToLabel[opt.value] = opt.label || opt.value
        changed = true
      }
    }
    if (changed) valueToLabel = valueToLabel
    return opts
  }

  function valueToSelected (value: string[], valueToLabel: any) {
    return value.map(v => ({ value: v, label: valueToLabel[v] }))
  }

  // if we get a value from the form that we haven't seen in the popup menu
  // yet, we won't have a label for it
  // this function runs getOptions on any selected values for which the label
  // is currently unknown
  function reactToValue (value: string[]) {
    if (value == null) return
    for (const v of value) {
      if (!valueToLabel[v]) wrapGetOptions(v).catch(console.debug)
    }
  }
</script>

<FieldStandard bind:id {label} {path} {required} {defaultValue} {conditional} let:value let:valid let:invalid let:id let:onBlur let:setVal>
  {@const _ = reactToValue(value)}
  <div class:valid class:invalid>
    <MultiSelect {id} name={path} {disabled} selected={valueToSelected(value, valueToLabel)} {placeholder} getOptions={wrapGetOptions} on:change={e => setVal(e.detail.map(itm => itm.value))} on:blur={onBlur}></MultiSelect>
  </div>
</FieldStandard>

<style>
  .invalid {
    --multiselect-border: 1px solid red;
  }
</style>
