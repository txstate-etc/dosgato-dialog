<script lang="ts">
  import { type HTMLActionEntry, passActions } from '@txstate-mws/svelte-components'
  import type { EditorView, ViewUpdate } from '@codemirror/view'
  import type { Diagnostic } from '@codemirror/lint'
  import { createEventDispatcher, onDestroy, onMount } from 'svelte'
  import { getDescribedBy } from '$lib'
  let className = ''
  export { className as class }
  export let id: string | undefined = undefined
  export let rows = 8
  export let preamble = ''
  export let sandbox = false
  export let use: HTMLActionEntry[] = []
  export let inputelement: HTMLElement | undefined = undefined
  export let extradescid: string | undefined = undefined
  export let helptextid: string | undefined = undefined
  export let messagesid: string | undefined = undefined
  export let valid: boolean | undefined = undefined
  export let invalid: boolean | undefined = undefined
  export let value: any

  const dispatch = createEventDispatcher()

  const PREAMBLE_PATH = '/preamble.ts'
  const FILE_PATH = '/input.ts'

  let updateCode: (code: string) => void
  let updatePreamble: (preamble: string) => void
  let editorelement: HTMLElement | undefined
  let editor: EditorView
  onMount(async () => {
    const [
      { EditorView, minimalSetup },
      { indentWithTab },
      { lineNumbers, highlightActiveLine, highlightActiveLineGutter, keymap },
      { autocompletion, completionKeymap, closeBracketsKeymap },
      { indentOnInput },
      { javascript },
      { tsFacet, tsSync, tsHover },
      ts,
      { createDefaultMapFromCDN, createSystem, createVirtualTypeScriptEnvironment }
    ] = await Promise.all([
      import('codemirror'),
      import('@codemirror/commands'),
      import('@codemirror/view'),
      import('@codemirror/autocomplete'),
      import('@codemirror/language'),
      import('@codemirror/lang-javascript'),
      import('@valtown/codemirror-ts'),
      import('typescript'),
      import('@typescript/vfs')
    ])

    const compilerOptions: import('typescript').CompilerOptions = {
      target: ts.ScriptTarget.ES2024,
      module: ts.ModuleKind.ESNext,
      lib: ['es2024'],
      strict: true
    }

    const fsMap = await createDefaultMapFromCDN(compilerOptions, ts.version, true, ts, undefined, fetch)
    fsMap.set(PREAMBLE_PATH, preamble)
    fsMap.set(FILE_PATH, value ?? '')

    // knownLibFilesForCompilerOptions may include legacy files not on CDN
    // ensure all expected lib files exist so TS doesn't throw
    // note: @typescript/vfs has a bug where empty string content is treated as
    // missing (falsy check in getScriptSnapshot), so we use a space
    const { knownLibFilesForCompilerOptions } = await import('@typescript/vfs')
    for (const lib of knownLibFilesForCompilerOptions(compilerOptions, ts)) {
      if (!fsMap.has('/' + lib)) fsMap.set('/' + lib, ' ')
    }

    fsMap.set(PREAMBLE_PATH, preamble || ' ')
    fsMap.set(FILE_PATH, value || ' ')

    const system = createSystem(fsMap)
    const env = createVirtualTypeScriptEnvironment(system, [PREAMBLE_PATH, FILE_PATH], ts, compilerOptions)

    const tsComplete: import('@codemirror/autocomplete').CompletionSource = (context) => {
      const content = env.getSourceFile(FILE_PATH)?.getFullText()
      if (!content) return null
      const line = context.state.doc.lineAt(context.pos)
      const textBefore = line.text.slice(0, context.pos - line.from)
      const wordMatch = textBefore.match(/\w*$/)
      const dotMatch = textBefore.match(/\.\s*$/)
      if (!wordMatch?.[0] && !dotMatch && !context.explicit) return null
      const from = context.pos - (wordMatch?.[0].length ?? 0)
      const completions = env.languageService.getCompletionsAtPosition(FILE_PATH, context.pos, {})
      if (!completions) return null
      return {
        from,
        options: completions.entries.map(entry => ({
          label: entry.name,
          type: entry.kind
        }))
      }
    }

    const { linter } = await import('@codemirror/lint')
    const importPattern = /\b(import|require)\s*(\(|['"]|{?\s*['"])/g
    const sandboxLinter = linter(view => {
      if (!sandbox) return []
      const diagnostics: Diagnostic[] = []
      const doc = view.state.doc
      for (let i = 1; i <= doc.lines; i++) {
        const line = doc.line(i)
        let match: RegExpExecArray | null
        importPattern.lastIndex = 0
        while ((match = importPattern.exec(line.text)) !== null) {
          diagnostics.push({
            from: line.from + match.index,
            to: line.from + match.index + match[0].length,
            severity: 'error',
            message: 'Imports are not allowed in this editor'
          })
        }
      }
      return diagnostics
    })

    editor = new EditorView({
      extensions: [
        minimalSetup,
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        javascript({ typescript: true }),
        autocompletion({ override: [tsComplete] }),
        sandboxLinter,
        indentOnInput(),
        tsFacet.of({ env, path: FILE_PATH }),
        tsSync(),
        tsHover(),
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
    updatePreamble = (text: string) => {
      env.updateFile(PREAMBLE_PATH, text)
    }
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
  $: updatePreamble?.(preamble)
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
