<script lang="ts">
  import { FORM_CONTEXT, FORM_INHERITED_PATH, Field, type FormStore } from '@txstate-mws/svelte-forms'
  import { getContext, onMount } from 'svelte'
  import { get, isNotBlank } from 'txstate-utils'
  import Switcher from './Switcher.svelte'
  let className = ''
  export { className as class }
  export let id: string | undefined = undefined
  export let path: string
  export let label: string = ''
  export let notNull = false
  export let choices: { label?: string, value: any, disabled?: boolean }[]
  export let defaultValue: any = notNull ? choices[0].value : undefined
  export let conditional: boolean | undefined = undefined
  export let required = false
  export let horizontal = false
  export let related: true | number = 0
  export let extradescid: string | undefined = undefined
  export let helptext: string | undefined = undefined
  export let number = false
  export let date = false
  export let datetime = false
  export let boolean = false
  export let serialize: ((value: any) => string) | undefined = undefined
  export let deserialize: ((value: string) => any) | undefined = undefined

  const store = getContext<FormStore>(FORM_CONTEXT)
  const inheritedPath = getContext<string>(FORM_INHERITED_PATH)
  const finalPath = [inheritedPath, path].filter(isNotBlank).join('.')

  let finalDeserialize: (value: string) => any
  function updateDeserialize (fDes: any) {
    finalDeserialize = fDes
  }
  async function reactToChoices (..._: any[]) {
    if (!finalDeserialize) return
    if (!choices.length) {
      return await store.setField(finalPath, finalDeserialize(''))
    }
    const val = get($store.data, finalPath)
    if (!choices.some(o => o.value === finalDeserialize(val))) await store.setField(finalPath, notNull ? defaultValue : finalDeserialize(''))
  }
  $: reactToChoices(choices).catch(console.error)
  onMount(reactToChoices)
</script>

<Field {path} {defaultValue} {conditional} {notNull} {number} {date} {datetime} {boolean} {serialize} {deserialize} let:value let:valid let:invalid let:onBlur let:onChange let:messages let:serialize let:deserialize>
  {@const _ = updateDeserialize(deserialize)}
  <Switcher bind:id {path} class={className} name={path} {horizontal} {label} iptValue={value} {valid} {invalid} {required} {related} {extradescid} {helptext} {messages} on:change={onChange} {onBlur} choices={choices.map(c => ({ ...c, value: serialize(c.value) }))} />
</Field>
