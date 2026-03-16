<script lang="ts">
  import { type HTMLActionEntry, passActions } from '@txstate-mws/svelte-components'
  import type { EditorView, ViewUpdate } from '@codemirror/view'

  import type { GraphQLSchema } from 'graphql'
  import { createEventDispatcher, onDestroy, onMount } from 'svelte'
  import { getDescribedBy } from '$lib'
  let className = ''
  export { className as class }
  export let id: string | undefined = undefined
  export let rows = 8
  export let schema: GraphQLSchema | undefined = undefined
  export let use: HTMLActionEntry[] = []
  export let inputelement: HTMLElement | undefined = undefined
  export let extradescid: string | undefined = undefined
  export let helptextid: string | undefined = undefined
  export let messagesid: string | undefined = undefined
  export let valid: boolean | undefined = undefined
  export let invalid: boolean | undefined = undefined
  export let value: any

  const dispatch = createEventDispatcher()

  let updateCode: (code: string) => void
  let updateEditorSchema: (schema?: GraphQLSchema) => void
  let editorelement: HTMLElement | undefined
  let editor: EditorView
  onMount(async () => {
    const { EditorView, minimalSetup } = await import('codemirror')
    const { indentWithTab } = await import('@codemirror/commands')
    const { lineNumbers, highlightActiveLine, highlightActiveLineGutter, keymap, hoverTooltip } = await import('@codemirror/view')
    const { autocompletion, completionKeymap, closeBracketsKeymap } = await import('@codemirror/autocomplete')
    const { indentOnInput } = await import('@codemirror/language')
    const { graphql, updateSchema, getSchema, offsetToPos } = await import('cm6-graphql')
    const { getHoverInformation } = await import('graphql-language-service')

    const graphqlHover = hoverTooltip((view, pos) => {
      const s = getSchema(view.state)
      if (!s) return null
      const queryText = view.state.doc.toString()
      const cursor = offsetToPos(view.state.doc, pos)
      const info = getHoverInformation(s, queryText, cursor, undefined, { useMarkdown: false })
      const content = Array.isArray(info) ? info.join('\n') : typeof info === 'string' ? info : ''
      if (!content) return null
      return {
        pos,
        above: true,
        create () {
          const dom = document.createElement('div')
          dom.style.cssText = 'padding: 4px 8px; font-size: 0.85em; font-family: monospace; white-space: pre-wrap;'
          dom.textContent = content
          return { dom }
        }
      }
    })

    editor = new EditorView({
      extensions: [
        minimalSetup,
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        autocompletion(),
        indentOnInput(),
        graphqlHover,
        ...graphql(schema),
        keymap.of([...completionKeymap, ...closeBracketsKeymap, indentWithTab]),
        EditorView.updateListener.of((v: ViewUpdate) => {
          if (v.docChanged) {
            const newval = editor.state.doc.toString()
            if (value !== newval) dispatch('change', newval)
          }
        })
      ],
      parent: editorelement
    })
    updateEditorSchema = (s?: GraphQLSchema) => { updateSchema(editor, s) }
    updateCode = code => {
      if (editor.state.doc.toString() !== code) editor.update([editor.state.update({ changes: { from: 0, to: editor.state.doc.length, insert: code } })])
    }
    inputelement = editorelement?.querySelector('.cm-content') ?? undefined
    if (id) inputelement?.setAttribute('id', id)
    if (className) inputelement?.classList.add(...className.split(' '), ...[])
    updateValidState()
  })
  onDestroy(() => {
    editor?.destroy()
  })
  $: updateCode?.(value ?? '')
  $: updateEditorSchema?.(schema)
  function updateValidState (..._: any[]) {
    inputelement?.setAttribute('aria-invalid', String(!!invalid))
    const descby = getDescribedBy([messagesid, helptextid, extradescid])
    if (descby) inputelement?.setAttribute('aria-describedby', descby)
    else inputelement?.removeAttribute('aria-describedby')
  }
  $: updateValidState(invalid, messagesid)
</script>

<div bind:this={editorelement} style:--cm-editor-minh="{rows * 1.5}em" class:valid class:invalid on:paste on:focusout use:passActions={use}></div>

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
