<script lang="ts">
  import { Field, FORM_INHERITED_PATH, type FormStore, FORM_CONTEXT } from '@txstate-mws/svelte-forms'
  import { getContext, onMount } from 'svelte'
  import { isNotBlank, randomid } from 'txstate-utils'

  export let path: string
  export let conditional: boolean | undefined = undefined
  export let length: number = 10

  const store = getContext<FormStore>(FORM_CONTEXT)
  const inheritedPath = getContext<string>(FORM_INHERITED_PATH)
  const finalPath = [inheritedPath, path].filter(isNotBlank).join('.')
  const valueStore = store.getField<string | null>(finalPath)

  onMount(() => {
    if (!$valueStore) store.setField(finalPath, randomid(length), { notDirty: true })
  })
</script>

<Field {path} {conditional} defaultValue={randomid(length)} notNull let:value>
  <input type="hidden" name={path} {value}>
</Field>
