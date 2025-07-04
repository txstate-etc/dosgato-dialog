<script lang="ts" context="module">
  export const DG_DIALOG_FIELD_MULTIPLE = {}
  function noOp (..._: any[]) { return '' }
</script>
<script lang="ts">
  import caretCircleDown from '@iconify-icons/ph/caret-circle-down-fill'
  import caretCircleUp from '@iconify-icons/ph/caret-circle-up-fill'
  import plusCircleLight from '@iconify-icons/ph/plus-circle-light'
  import xCircle from '@iconify-icons/ph/x-circle-fill'
  import { AddMore, type Feedback } from '@txstate-mws/svelte-forms'
  import { setContext } from 'svelte'
  import { writable } from 'svelte/store'
  import Button from './Button.svelte'
  import Container from './Container.svelte'
  import Icon from './Icon.svelte'

  export let path: string
  export let label: string
  export let initialState: any | ((index: number) => any) = undefined
  export let minLength = 1
  export let maxLength: number | undefined = undefined
  export let compact = false
  export let removable = false
  export let reorder = false
  export let conditional: boolean | undefined = undefined
  export let addMoreText = 'Add'
  export let maxedText = addMoreText
  export let addMoreClass: string | undefined = undefined
  export let related: true | number = 0
  export let helptext: string | undefined = undefined
  /**
   * If you want to ask users if they're sure before removing an array element, fill this
   * prop with the question that should be in the confirmation dialog.
   *
   * Alternatively, you can provide a function to generate the question from the item being
   * deleted. e.g. (item) => `Are you sure you want to delete ${item.name}?`
   */
  export let confirmDelete: string | ((item: any) => string) | undefined = undefined

  const fieldMultipleContext: { helptextid: string | undefined } = { helptextid: undefined }
  setContext(DG_DIALOG_FIELD_MULTIPLE, fieldMultipleContext)

  const reorderupelements: HTMLButtonElement[] = []
  const reorderdownelements: HTMLButtonElement[] = []
  function moveUpAndFocus (onMove: () => void, idx: number) {
    return () => {
      onMove()
      let newFocus = reorderupelements[idx - 1]
      if (newFocus) {
        if (newFocus.disabled) newFocus = reorderdownelements[idx - 1]
        newFocus.focus()
      }
    }
  }
  function moveDownAndFocus (onMove: () => void, idx: number) {
    return () => {
      onMove()
      let newFocus = reorderdownelements[idx + 1]
      if (newFocus) {
        if (newFocus.disabled) newFocus = reorderupelements[idx + 1]
        newFocus.focus()
      }
    }
  }

  function confirmedDelete (onDelete: () => void, item: any) {
    return () => {
      if (confirmDelete == null) return onDelete()
      const msg = typeof confirmDelete === 'string' ? confirmDelete : confirmDelete(item)
      if (confirm(msg)) onDelete()
    }
  }

  let messages: Feedback[] = []
</script>

<Container {path} {label} {messages} {conditional} {related} {helptext} let:helptextid>
  {noOp(fieldMultipleContext.helptextid = helptextid)}
  <AddMore bind:messages {path} {initialState} {minLength} {maxLength} {conditional} let:path let:currentLength let:maxLength let:index let:minned let:maxed let:value let:onDelete let:onMoveUp let:onMoveDown>
    {@const showDelete = removable && !minned}
    {@const showMove = reorder && currentLength > 1}
    <div class="dialog-multiple" class:has-delete-icon={showDelete} class:has-move-icon={showMove} class:first={index === 0}>
      <div class="dialog-multiple-content">
        <slot {path} {index} {value} {maxed} {maxLength} {currentLength}/>
      </div>
      {#if showDelete || showMove}<div class="dialog-multiple-buttons">
        {#if showMove}
          <button bind:this={reorderdownelements[index]} class="dialog-multiple-move" type="button" disabled={index === currentLength - 1} on:click|preventDefault|stopPropagation={moveDownAndFocus(onMoveDown, index)}><Icon icon={caretCircleDown} hiddenLabel="move down in the list" /></button>
          <button bind:this={reorderupelements[index]} class="dialog-multiple-move" type="button" disabled={index === 0} on:click|preventDefault|stopPropagation={moveUpAndFocus(onMoveUp, index)}><Icon icon={caretCircleUp} hiddenLabel="move up in the list" /></button>
        {/if}
        {#if showDelete}<button class="dialog-multiple-delete" type="button" on:click|preventDefault|stopPropagation={confirmedDelete(onDelete, value)}><Icon icon={xCircle} hiddenLabel="remove from list" /></button>{/if}
      </div>{/if}
    </div>
    <svelte:fragment slot="addbutton" let:maxed let:onClick>
      {#if !maxed || (maxed && maxLength > 1)}
        <Button type="button" icon={plusCircleLight} class="{addMoreClass} dialog-multiple-button" disabled={maxed} on:click={onClick}>{maxed ? maxedText : addMoreText}</Button>
      {/if}
    </svelte:fragment>
  </AddMore>
</Container>

<style>
  .dialog-multiple {
    position: relative;
    border: var(--dialog-container-border, 1px dashed #CCCCCC);
    padding: var(--dialog-container-padding, 1.5em);
  }
  .dialog-multiple:not(.first) {
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
  .dialog-multiple-buttons {
    position: absolute;
    top: 0;
    right: 0.1em;
    display: flex;
  }
  .dialog-multiple-buttons button {
    border: 0;
    background: transparent;
    padding: 0.15em;
    cursor: pointer;
    font-size: 1.3em;
    color: black;
  }
  .dialog-multiple-buttons .dialog-multiple-delete {
    color: var(--dg-danger-bg, #9a3332);
  }
  .dialog-multiple-buttons button:disabled {
    color: #6d6d6d;
  }
</style>
