<!-- @component
  The purpose of `<FieldStandard>` is to provide a standard [`<Field>`](https://github.com/txstate-etc/svelte-forms#field)
  component that not only handles the association of a state/value with the JSON payload associated with a
  [`FormStore`](https://github.com/txstate-etc/svelte-forms/blob/main/src/lib/FormStore.ts) but also handles
  common rendering for helptext, aria descriptions, and `Feedback` messages for its slotted components
  by encapsulating them in a [`<Container>`](https://github.com/txstate-etc/dosgato-dialog/blob/main/src/lib/Container.svelte)
  setup to work in conjuction with the parent `<Field>` tag.
-->
<script lang="ts">
  import { Field } from '@txstate-mws/svelte-forms'
  import { randomid } from 'txstate-utils'
  import Container from './Container.svelte'
  /** If the input that's being built has an id pass it here so the label can point at it. */
  export let id = randomid()
  /** If `descid` is defined then this assumes you've made an outside label referenced to by descid `<div id={descid}`.
  Useful for things like checkboxes and radio buttons that have their own individual labels. */
  export let descid: string|undefined = undefined
  export let path: string
  export let defaultValue: any = undefined
  /** A label for the Container `<div>`. */
  export let label: string
  export let notNull = false
  export let number = false
  export let date = false
  export let datetime = false
  export let boolean = false
  export let serialize: ((value: any) => string)|undefined = undefined
  export let deserialize: ((value: string) => any)|undefined = undefined
  /** If you need to do some processing just before submit or validate define that processing here. */
  export let finalize: ((value: any, isSubmit: boolean) => any)|undefined = undefined
  /** If you specified a finalize, you probably need an initialize to invert it. */
  export let initialize: ((value: any) => any)|undefined = undefined
  export let conditional: boolean|undefined = undefined
  export let required = false
  export let related: true | number = 0
  export let helptext: string|undefined = undefined
</script>

<Field {path} {defaultValue} {conditional} {notNull} {number} {date} {datetime} {boolean} {serialize} {deserialize} {initialize} {finalize} let:path let:value let:onBlur let:onChange let:setVal let:messages let:valid let:invalid let:serialize let:deserialize>
  <Container {id} {label} {messages} {descid} {required} {related} {helptext} let:messagesid let:helptextid>
    <slot {id} {path} {value} {onBlur} {onChange} {setVal} {valid} {invalid} {messagesid} {helptextid} {serialize} {deserialize} />
  </Container>
</Field>
