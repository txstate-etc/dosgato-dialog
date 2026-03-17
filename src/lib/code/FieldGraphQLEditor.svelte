<script lang="ts">
  import type { HTMLActionEntry } from '@txstate-mws/svelte-components'
  import type { GraphQLSchema } from 'graphql'
  import { nullableSerialize, nullableDeserialize } from '@txstate-mws/svelte-forms'
  import { FieldStandard } from '$lib'
  import GraphQLEditor from './GraphQLEditor.svelte'
  let className = ''
  export { className as class }
  export let id: string | undefined = undefined
  export let path: string
  export let label = ''
  export let notNull = false
  export let defaultValue: any = notNull ? '' : undefined
  export let rows = 8
  export let conditional: boolean | undefined = undefined
  export let required = false
  export let use: HTMLActionEntry[] = []
  export let inputelement: HTMLElement = undefined as any
  export let related: true | number = 0
  export let extradescid: string | undefined = undefined
  export let helptext: string | undefined = undefined
  export let schema: GraphQLSchema | undefined = undefined
</script>

<FieldStandard bind:id {label} {path} {required} {defaultValue} {conditional} {related} {helptext} serialize={!notNull ? nullableSerialize : undefined} deserialize={!notNull ? nullableDeserialize : undefined} let:value let:valid let:invalid let:id={fieldid} let:onBlur let:setVal let:messagesid let:helptextid>
  <GraphQLEditor id={fieldid} bind:inputelement {schema} {rows} class={className} {value} {valid} {invalid} {helptextid} {messagesid} {extradescid} on:paste on:focusout={onBlur} {use} on:change={e => setVal(e.detail)}/>
</FieldStandard>
