<script lang="ts">
  import { MultiSelect } from '@txstate-mws/svelte-components'
  import type { PopupMenuItem } from '@txstate-mws/svelte-components'
  import { Store } from '@txstate-mws/svelte-store'
  import FieldStandard from './FieldStandard.svelte'
  import { onMount } from 'svelte'
  import { isNotBlank } from 'txstate-utils'

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
  const valueToLabel: Record<string, string> = {}

  async function wrapGetOptions (search: string) {
    const opts = await getOptions(search)
    // if no options are returned with the search term, we can end up with an infinite loop
    // the first time reactToValue calls wrapGetOptions
    // if (opts.length === 0) {
    //   opts = await getOptions('')
    // }
    for (const opt of opts) {
      valueToLabel[opt.value] = opt.label || opt.value
    }
    return opts
  }

  const selectedStore = new Store<{ value: string, label: string }[]>([])
  let hasInit = !defaultValue.length

  onMount(async () => {
    await reactToValue(defaultValue)
    hasInit = true
  })

  // if we get a value from the form that we haven't seen in the popup menu
  // yet, we won't have a label for it
  // this function runs getOptions on any selected values for which the label
  // is currently unknown
  async function reactToValue (value: string[]) {
    await Promise.all(value.map(async v => {
      if (!valueToLabel[v]) await wrapGetOptions(v)
    }))
    selectedStore.set(value.map(v => ({ value: v, label: valueToLabel[v] })).filter(v => isNotBlank(v.label)))
  }
</script>

{#if hasInit}
  <FieldStandard bind:id {label} {path} {required} {defaultValue} {conditional} let:value let:valid let:invalid let:id let:onBlur let:setVal>
    {@const _ = reactToValue(value)}
    <div class:valid class:invalid>
      <MultiSelect {id} name={path} {disabled} selected={$selectedStore} {placeholder} getOptions={wrapGetOptions} on:change={e => setVal(e.detail.map(itm => itm.value))} on:blur={onBlur}></MultiSelect>
    </div>
  </FieldStandard>
{/if}

<style>
  .invalid {
    --multiselect-border: 1px solid red;
  }
</style>
