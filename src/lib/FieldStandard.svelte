<script lang="ts">
  import { Field } from '@txstate-mws/svelte-forms'
  import { randomid } from 'txstate-utils'
  import Container from './Container.svelte'
  export let id = randomid()
  export let descid: string|undefined = undefined
  export let path: string
  export let defaultValue: any = undefined
  export let label: string
  export let notNull = false
  export let number = false
  export let date = false
  export let datetime = false
  export let boolean = false
  export let serialize: ((value: any) => string)|undefined = undefined
  export let deserialize: ((value: string) => any)|undefined = undefined
  export let finalize: ((value: any) => any)|undefined = undefined
  export let conditional: boolean|undefined = undefined
  export let required = false
  export let related: true | number = 0
  export let helptext: string|undefined = undefined
</script>

<Field {path} {defaultValue} {conditional} {notNull} {number} {date} {datetime} {boolean} {serialize} {deserialize} {finalize} let:path let:value let:onBlur let:onChange let:setVal let:messages let:valid let:invalid let:serialize let:deserialize>
  <Container {id} {label} {messages} {descid} {required} {related} {helptext} let:messagesid let:helptextid>
    <slot {id} {path} {value} {onBlur} {onChange} {setVal} {valid} {invalid} {messagesid} {helptextid} {serialize} {deserialize} />
  </Container>
</Field>
