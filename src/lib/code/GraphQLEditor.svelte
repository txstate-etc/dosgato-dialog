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
  export let noMutations = false
  export let allowInvalid = false
  export let use: HTMLActionEntry[] = []
  export let inputelement: HTMLElement | undefined = undefined
  export let extradescid: string | undefined = undefined
  export let helptextid: string | undefined = undefined
  export let messagesid: string | undefined = undefined
  export let valid: boolean | undefined = undefined
  export let invalid: boolean | undefined = undefined
  export let value: any

  const dispatch = createEventDispatcher()

  let editorInvalid = false
  let updateCode: (code: string) => void
  let updateEditorSchema: (schema?: GraphQLSchema) => void
  let editorelement: HTMLElement | undefined
  let editor: EditorView
  onMount(async () => {
    const { EditorView, minimalSetup } = await import('codemirror')
    const { EditorState } = await import('@codemirror/state')
    const { indentWithTab } = await import('@codemirror/commands')
    const { lineNumbers, highlightActiveLine, highlightActiveLineGutter, keymap, hoverTooltip } = await import('@codemirror/view')
    const { autocompletion, completionKeymap, closeBracketsKeymap } = await import('@codemirror/autocomplete')
    const { setDiagnosticsEffect } = await import('@codemirror/lint')
    const { indentOnInput } = await import('@codemirror/language')
    const { graphql, updateSchema, getSchema, offsetToPos, getHoverInformation, getDiagnostics, GraphQLSchema: GQLSchema, GraphQLObjectType, GraphQLString } = await import('./_graphql-env.js')

    function stripMutations (s?: GraphQLSchema): GraphQLSchema | undefined {
      if (!s || !noMutations) return s
      const config = s.toConfig()
      const emptyMutation = new GraphQLObjectType({ name: 'Mutation', fields: { _: { type: GraphQLString } } })
      const types = config.types.filter(t => t.name !== 'Mutation')
      return new GQLSchema({ ...config, mutation: emptyMutation, types: [...types, emptyMutation] })
    }

    const graphqlHover = hoverTooltip((view, pos) => {
      const s = getSchema(view.state)
      if (!s) return null
      const queryText = view.state.doc.toString()
      const cursor = offsetToPos(view.state.doc, pos)
      const info = getHoverInformation(s, queryText, cursor, undefined, { useMarkdown: false })
      const content = Array.isArray(info) ? info.map(i => typeof i === 'string' ? i : i.value).join('\n') : typeof info === 'string' ? info : ''
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
        ...graphql(stripMutations(schema)),
        EditorState.transactionFilter.of(tr => {
          if (!tr.newDoc.toString().trim() && tr.effects.some(e => e.is(setDiagnosticsEffect))) {
            return { changes: tr.changes, effects: tr.effects.filter(e => !e.is(setDiagnosticsEffect)) }
          }
          return tr
        }),
        keymap.of([...completionKeymap, ...closeBracketsKeymap, indentWithTab]),
        EditorView.updateListener.of((v: ViewUpdate) => {
          if (v.docChanged) {
            const newval = editor.state.doc.toString()
            if (value === newval) return
            if (!allowInvalid) {
              const effectiveSchema = getSchema(v.state)
              if (!effectiveSchema || !newval.trim() || getDiagnostics(newval, effectiveSchema).some(e => e.severity === 1)) {
                editorInvalid = true
                dispatch('change', '')
                return
              }
            }
            editorInvalid = false
            dispatch('change', newval)
          }
        })
      ],
      parent: editorelement
    })
    updateEditorSchema = (s?: GraphQLSchema) => { updateSchema(editor, stripMutations(s)) }
    updateCode = code => {
      if (editorInvalid) return
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
