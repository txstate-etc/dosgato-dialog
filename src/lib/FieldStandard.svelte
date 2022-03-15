<script lang="ts">
  import { Field } from '@txstate-mws/svelte-forms'
  import { randomid } from 'txstate-utils'
  import Container from './Container.svelte'
  export let id = randomid()
  export let descid: string|undefined = undefined
  export let path: string
  export let defaultValue: any = undefined
  export let label: string
  export let serialize: ((value: any) => string)|undefined = undefined
  export let deserialize: ((value: string) => any)|undefined = undefined
  export let conditional: boolean|undefined = undefined
  export let required = false
</script>

<Field {path} {defaultValue} {conditional} {serialize} {deserialize} let:path let:value let:onBlur let:onChange let:setVal let:messages let:valid let:invalid>
  <Container {id} {label} {messages} {descid} {required} let:messagesid>
    <slot {id} {path} {value} {onBlur} {onChange} {setVal} {valid} {invalid} {messagesid} />
  </Container>
</Field>
