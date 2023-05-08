<script lang="ts">
  import { type HTMLActionEntry, passActions } from '@txstate-mws/svelte-components'
  import { nullableSerialize, nullableDeserialize, FORM_CONTEXT, FormStore, FORM_INHERITED_PATH } from '@txstate-mws/svelte-forms'
  import type { ViewUpdate } from '@codemirror/view'
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
  export let related: true | number = 0
  export let extradescid: string | undefined = undefined
  export let helptext: string | undefined = undefined
  export let language: 'js'|'css'|'html'

  const store = getContext<FormStore>(FORM_CONTEXT)
  const inheritedPath = getContext<string>(FORM_INHERITED_PATH)
  const finalPath = [inheritedPath, path].filter(isNotBlank).join('.')
  const value = store.getField<string | undefined>(finalPath)

  let editorelement: HTMLElement
  let updateCode: (code: string) => void
  onMount(async () => {
    const { EditorView, minimalSetup } = await import('codemirror')
    const { indentWithTab } = await import('@codemirror/commands')
    const { lineNumbers, highlightActiveLine, highlightActiveLineGutter, keymap } = await import('@codemirror/view')
    const { langmap } = await import('./langs.js')
    const editor = new EditorView({
      extensions: [
        minimalSetup,
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        langmap[language],
        keymap.of([indentWithTab]),
        EditorView.updateListener.of((v: ViewUpdate) => {
          if (v.docChanged) {
            const newval = editor.state.doc.toString()
            if ($value !== newval) mySetVal?.(newval)
          }
        })
      ],
      parent: editorelement
    })
    updateCode = code => {
      if (editor.state.doc.toString() !== code) editor.update([editor.state.update({ changes: { from: 0, to: editor.state.doc.length, insert: code } })])
    }
    inputelement = editorelement.querySelector(`#${id}`) as HTMLTextAreaElement
    if (className) inputelement.classList.add(...className.split(' '))
    updateValidState(invalid, messagesid)
  })
  $: updateCode?.($value ?? '')

  let invalid: boolean
  let messagesid: string | undefined
  let helptextid: string | undefined
  let mySetVal: (code?: any) => void
  function setSlotProps (helptextidIn: string | undefined, setValIn: any) {
    helptextid = helptextidIn
    mySetVal = setValIn
  }
  function updateValidState (invalidIn: boolean | undefined, messagesIdIn: any) {
    invalid = !!invalidIn
    messagesid = messagesIdIn
    inputelement?.setAttribute('aria-invalid', String(!!invalid))
    const descby = getDescribedBy([messagesid, helptextid, extradescid])
    if (descby) inputelement?.setAttribute('aria-describedby', descby)
    else inputelement?.removeAttribute('aria-describedby')
  }
</script>

<FieldStandard bind:id {label} {path} {required} {defaultValue} {conditional} {related} {helptext} serialize={!notNull ? nullableSerialize : undefined} deserialize={!notNull ? nullableDeserialize : undefined} let:value let:valid let:invalid let:id let:onBlur let:setVal let:messagesid let:helptextid>
  {@const _ = setSlotProps(helptextid, setVal)}
  {@const __ = updateValidState(invalid, messagesid)}
  <div bind:this={editorelement} style:--cm-editor-minh="{rows * 1.5}em" class:valid class:invalid on:paste on:focusout={onBlur} use:passActions={use}></div>
</FieldStandard>

<style>
  div {
    background-color: white;
  }
  div :global(.cm-content), div :global(.cm-gutter) {
    min-height: var(--cm-editor-minh, 10em);
  }

  div :global(.cm-scroller) {
    overflow: auto;
    resize: vertical;
  }
</style>
