<script lang="ts">
  import { Field } from '@txstate-mws/svelte-forms'
  import Switcher from './Switcher.svelte'
  let className = ''
  export { className as class }
  export let id: string | undefined = undefined
  export let path: string
  export let label: string = ''
  export let notNull = false
  export let choices: { label?: string, value: any, disabled?: boolean }[]
  export let defaultValue: any = notNull ? choices[0].value : undefined
  export let conditional: boolean|undefined = undefined
  export let required = false
  export let horizontal = false
  export let related: true | number = 0
  export let extradescid: string | undefined = undefined
  export let helptext: string | undefined = undefined
  export let number = false
  export let date = false
  export let datetime = false
  export let boolean = false
  export let serialize: ((value: any) => string)|undefined = undefined
  export let deserialize: ((value: string) => any)|undefined = undefined
</script>

<Field {path} {defaultValue} {conditional} {notNull} {number} {date} {datetime} {boolean} {serialize} {deserialize} let:value let:valid let:invalid let:onBlur let:onChange let:messages let:serialize>
  <Switcher bind:id class={className} name={path} {horizontal} {label} iptValue={value} {valid} {invalid} {required} {related} {extradescid} {helptext} {messages} on:change={onChange} {onBlur} choices={choices.map(c => ({ ...c, value: serialize(c.value) }))} />
</Field>
