<script lang="ts">
  import plusCircleLight from '@iconify-icons/ph/plus-circle-light'
  import { AddMore, FORM_CONTEXT, FORM_INHERITED_PATH } from '@txstate-mws/svelte-forms'
  import type { FormStore } from '@txstate-mws/svelte-forms'
  import { derivedStore } from '@txstate-mws/svelte-store'
  import { getContext } from 'svelte'
  import { isNotNull } from 'txstate-utils'
  import Button from './Button.svelte'
  import Container from './Container.svelte'

  export let path: string
  export let label: string
  export let initialState: any = undefined
  export let minLength = 1
  export let maxLength: number|undefined = undefined
  export let compact = false
  export let removable = false
  export let reorder = false
  export let conditional: boolean|undefined = undefined
  export let addMoreText = 'Add'
  export let maxedText = addMoreText
  export let addMoreClass: string = undefined

  const inheritedPath = getContext<string>(FORM_INHERITED_PATH)
  const finalPath = [inheritedPath, path].filter(isNotNull).join('.')
  const store = getContext<FormStore>(FORM_CONTEXT)
  const messageStore = derivedStore(store, ({ messages }) => messages.all.filter(m => m.path?.startsWith(finalPath)))

  const reorderelements: HTMLButtonElement[] = []
  function moveUpAndFocus (onMoveUp: Function, idx: number) {
    return () => {
      onMoveUp()
      reorderelements[idx - 1]?.focus()
    }
  }

  $: messages = compact ? $messageStore : []
</script>

<Container {label} {messages}>
  <AddMore {path} {initialState} {minLength} {maxLength} {conditional} let:path let:currentLength let:maxLength let:index let:minned let:maxed let:value let:onDelete let:onMoveUp>
    {@const showDelete = removable && !minned}
    {@const showMove = reorder && index > 0}
    <div class="dialog-multiple" class:has-delete-icon={showDelete}>
      <div class="dialog-multiple-content">
        <slot {path} {index} {value} {maxed} {maxLength} {currentLength} />
      </div>
      {#if showDelete || showMove}<div class="dialog-multiple-buttons">
        {#if reorder}<button bind:this={reorderelements[index]} class="dialog-multiple-move" type="button" aria-hidden={!showMove} disabled={!showMove} style:visibility={showMove ? 'visible' : 'hidden'} on:click|preventDefault|stopPropagation={moveUpAndFocus(onMoveUp, index)}>^</button>{/if}
        {#if showDelete}<button class="dialog-multiple-delete" type="button" on:click|preventDefault|stopPropagation={onDelete}>X</button>{/if}
      </div>{/if}
    </div>
    <svelte:fragment slot="addbutton" let:maxed let:onClick>
      <Button type="button" icon={plusCircleLight} class="{addMoreClass} dialog-multiple-button" disabled={maxed} on:click={onClick}>{maxed ? maxedText : addMoreText}</Button>
    </svelte:fragment>
  </AddMore>
</Container>

<style>
  .dialog-multiple {
    position: relative;
    border: var(--dialog-container-border, 0);
    padding: var(--dialog-container-padding, 1em);
  }
  .dialog-multiple:not(:first-child) {
    border-top: 0;
  }
  .dialog-multiple:nth-of-type(even) {
    background-color: var(--dialog-field-bg1, transparent);
    color: var(--dialog-field-text1, inherit);
  }
  .dialog-multiple:nth-of-type(odd) {
    background-color: var(--dialog-field-bg2, transparent);
    color: var(--dialog-field-text2, inherit);
  }
  :global(.dialog-multiple-button) {
    margin-left: var(--dialog-container-padding, 1em);
  }
  .dialog-multiple.has-delete-icon {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .dialog-multiple-buttons {
    margin-left: 0.75em;
  }
  .dialog-multiple-buttons button {
    margin-left: 0.2em;
  }
  .dialog-multiple-buttons button:first-child {
    margin-left: 0;
  }
  .dialog-multiple-content {
    flex-grow: 1;
  }
</style>
