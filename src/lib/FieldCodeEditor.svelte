<script lang="ts">
  import { type HTMLActionEntry, passActions } from '@txstate-mws/svelte-components'
  import { nullableSerialize, nullableDeserialize, FORM_CONTEXT, FormStore, FORM_INHERITED_PATH } from '@txstate-mws/svelte-forms'
  import CodeFlask from 'codeflask'
  import { getContext, onMount } from 'svelte'
  import { isNotBlank } from 'txstate-utils'
  import { getDescribedBy, FieldStandard } from '$lib'
  let className = ''
  export { className as class }
  export let id: string | undefined = undefined
  export let path: string
  export let label: string = ''
  export let notNull = false
  export let defaultValue: any = notNull ? '' : undefined
  export let rows = 8
  export let conditional: boolean|undefined = undefined
  export let required = false
  export let use: HTMLActionEntry[] = []
  export let inputelement: HTMLTextAreaElement = undefined as any
  export let helptext: string | undefined = undefined
  export let language: 'js'|'css'|'html'

  const store = getContext<FormStore>(FORM_CONTEXT)
  const inheritedPath = getContext<string>(FORM_INHERITED_PATH)
  const finalPath = [inheritedPath, path].filter(isNotBlank).join('.')
  const value = store.getField<string | undefined>(finalPath)

  let editorelement: HTMLElement
  let flask: CodeFlask
  onMount(() => {
    flask = new CodeFlask(editorelement, { language, lineNumbers: true, areaId: id })
    inputelement = editorelement.querySelector(`#${id}`) as HTMLTextAreaElement
    if (className) inputelement.classList.add(...className.split(' '))
    inputelement.addEventListener('change', onChange)
    updateValidState(invalid, messagesid)
  })
  $: flask?.updateCode($value ?? '')

  let invalid: boolean
  let messagesid: string | undefined
  let helptextid: string | undefined
  let onChange: (e?: any) => void
  function setSlotProps (helptextidIn: string | undefined, onChangeIn: any) {
    helptextid = helptextidIn
    onChange = onChangeIn
  }
  function updateValidState (invalidIn: boolean | undefined, messagesIdIn: any) {
    invalid = !!invalidIn
    messagesid = messagesIdIn
    inputelement?.setAttribute('aria-invalid', String(!!invalid))
    const descby = getDescribedBy([messagesid, helptextid])
    if (descby) inputelement?.setAttribute('aria-describedby', descby)
    else inputelement?.removeAttribute('aria-describedby')
  }
</script>

<FieldStandard bind:id {label} {path} {required} {defaultValue} {conditional} {helptext} serialize={!notNull ? nullableSerialize : undefined} deserialize={!notNull ? nullableDeserialize : undefined} let:value let:valid let:invalid let:id let:onBlur let:onChange let:messagesid let:helptextid>
  {@const _ = setSlotProps(helptextid, onChange)}
  {@const __ = updateValidState(invalid, messagesid)}
  <div bind:this={editorelement} style:height="{rows * 1.333}em" class:valid class:invalid on:paste on:focusout={onBlur} use:passActions={use}></div>
</FieldStandard>

<style>
  div {
    position: relative;
    overflow: hidden;
    resize: vertical;
  }
</style>
