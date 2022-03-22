<script lang="ts">
  import alertOutline from '@iconify/icons-mdi/alert-outline'
  import { FORM_CONTEXT, nullableDeserialize, nullableSerialize, type FormStore } from '@txstate-mws/svelte-forms'
  import type { EditorConfig } from '@ckeditor/ckeditor5-core/src/editor/editorconfig'
  import type ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor'
  import { getContext, onMount } from 'svelte'
  import FieldStandard from './FieldStandard.svelte'
  import Icon from './Icon.svelte'

  export let id: string | undefined = undefined
  export let path: string
  export let label: string = ''
  export let maxlength: number|undefined = undefined
  export let conditional: boolean|undefined = undefined
  export let required = false
  export let config: EditorConfig|undefined = undefined

  const formStore = getContext<FormStore>(FORM_CONTEXT)
  const value = formStore.getField<string>(path)

  let element: HTMLElement
  let editor: ClassicEditor
  onMount(async () => {
    const Editor = (await import('@ckeditor/ckeditor5-build-classic')).default
    editor = await Editor.create(element, config)
    editor.model.document.on('change:data', () => formStore.setField(path, nullableDeserialize(editor.getData())))
    if ($value?.length) editor.setData(nullableSerialize($value))
  })
  let charlength: number = 0
  function reactToValue (..._: any) {
    if (!editor) return
    const serialized = nullableSerialize($value)
    if (editor.getData() !== serialized) editor.setData(serialized)
    const root = editor?.editing?.view?.getDomRoot()
    if (root && root instanceof HTMLElement) charlength = root.innerText.trim().length
  }
  $: reactToValue($value)
  $: exceeded = maxlength > 0 && charlength > maxlength
</script>

<FieldStandard bind:id {label} {path} {required} {conditional} let:id let:onBlur>
  <div {id} bind:this={element}></div>
  {#if maxlength}
    <div class="dialog-rich-charcount">
      <span class="dialog-rich-count" class:exceeded>
        {#if exceeded}<Icon icon={alertOutline} inline />{/if}
        {charlength}
      </span>
      /
      <span class="dialog-rich-max">{maxlength}</span>
    </div>
  {/if}
</FieldStandard>

<style>
  .dialog-rich-charcount {
    text-align: right;
  }
  .dialog-rich-count.exceeded {
    color: #9a3332;
  }
</style>
