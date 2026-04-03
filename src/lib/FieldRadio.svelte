<script lang="ts">
  import { FORM_CONTEXT, FORM_INHERITED_PATH, Field, type FormStore } from '@txstate-mws/svelte-forms'
  import { getContext, onMount } from 'svelte'
  import { equal, get, isNotBlank } from 'txstate-utils'
  import Switcher from './Switcher.svelte'
  let className = ''
  export { className as class }
  export let id: string | undefined = undefined
  export let path: string
  export let label = ''
  export let notNull = false
  export let choices: { label?: string, value: any, disabled?: boolean }[] | undefined
  export let defaultValue: any = undefined
  export let conditional = true
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

  const inheritedPath = getContext<string>(FORM_INHERITED_PATH)
  const finalPath = [inheritedPath, path].filter(isNotBlank).join('.')
</script>

<Field {path} {defaultValue} allowedValues={choices?.map(c => c.value)} {conditional} {notNull} {number} {date} {datetime} {boolean} {serialize} {deserialize} let:deserialize={finalDeserialize} let:serialize={finalSerialize} let:value let:valid let:invalid let:onBlur let:setVal let:messages>
  <Switcher bind:id {path} class={className} name={finalPath} {horizontal} {label} iptValue={value} {valid} {invalid} {required} {related} {extradescid} {helptext} {messages} on:change={e => setVal(finalDeserialize(e.detail))} {onBlur} choices={choices?.map(c => ({ ...c, value: finalSerialize(c.value) })) ?? []} />
</Field>
