<script lang="ts">
  import { AddMore, FORM_CONTEXT, FORM_INHERITED_PATH } from '@txstate-mws/svelte-forms'
  import type { FormStore } from '@txstate-mws/svelte-forms'
  import { derivedStore } from '@txstate-mws/svelte-store'
  import { getContext } from 'svelte'
  import { isNotNull } from 'txstate-utils'
  import Container from './Container.svelte'

  export let path: string
  export let label: string
  export let initialState: any = undefined
  export let compact = false
  export let conditional: boolean|undefined = undefined

  const inheritedPath = getContext<string>(FORM_INHERITED_PATH)
  const finalPath = [inheritedPath, path].filter(isNotNull).join('.')
  const store = getContext<FormStore>(FORM_CONTEXT)
  const messageStore = derivedStore(store, ({ messages }) => messages.all.filter(m => m.path?.startsWith(finalPath)))

  $: messages = compact ? $messageStore : []
</script>

<Container {label} {messages}>
  <AddMore {path} {initialState} {conditional} let:path let:maxLength let:index let:maxed let:value>
    <slot {path} {index} {value} {maxed} {maxLength} />
  </AddMore>
</Container>
