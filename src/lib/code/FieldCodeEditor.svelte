<script lang="ts">
  import type { HTMLActionEntry } from '@txstate-mws/svelte-components'
  import { nullableSerialize, nullableDeserialize } from '@txstate-mws/svelte-forms'
  import { FieldStandard } from '$lib'
  import CodeEditor from './CodeEditor.svelte'
  let className = ''
  export { className as class }
  export let id: string | undefined = undefined
  export let path: string
  export let label: string = ''
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
  export let language: 'js' | 'css' | 'html'
</script>

<FieldStandard bind:id {label} {path} {required} {defaultValue} {conditional} {related} {helptext} serialize={!notNull ? nullableSerialize : undefined} deserialize={!notNull ? nullableDeserialize : undefined} let:value let:valid let:invalid let:id let:onBlur let:setVal let:messagesid let:helptextid>
  <CodeEditor {id} bind:inputelement {language} {rows} class={className} {value} {valid} {invalid} {helptextid} {messagesid} {extradescid} on:paste on:focusout={onBlur} {use} on:change={e => setVal(e.detail)}/>
</FieldStandard>
