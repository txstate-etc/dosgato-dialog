<script lang="ts">
  import { Field } from '@txstate-mws/svelte-forms'
  import { randomid } from 'txstate-utils'
  import InlineMessages from './InlineMessages.svelte'
  import InputContainer from './InputContainer.svelte'
  export let path: string
  export let index: number|undefined = undefined
  export let label: string = ''
  export let defaultValue: string|undefined = undefined
  const id = randomid()
</script>

<InputContainer>
  <Field {path} {index} {defaultValue} let:path let:value let:onBlur let:onChange let:setVal let:messages>
    <label for={id}>{label}</label>
    <input type="text" {id} name={path} {value} on:change={onChange} on:blur={onBlur} on:keyup={onChange}>
    <InlineMessages {messages} />
  </Field>
</InputContainer>

<style>
  label {
    width: 30%;
  }
</style>
