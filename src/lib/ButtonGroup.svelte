<script lang="ts">
  import { modifierKey, type PopupMenuItem } from '@txstate-mws/svelte-components'
  import { createEventDispatcher } from 'svelte'

  export let name: string | undefined = undefined
  export let choices: PopupMenuItem[]
  export let value = choices[0].value
  export let groupid: string | undefined = undefined
  export let messagesid: string | undefined = undefined
  export let ariaControls: string | undefined = undefined
  export let disabled = false
  export let valid = false
  export let invalid = false

  const dispatch = createEventDispatcher()

  const elements: HTMLElement[] = []

  function update (newVal: string) {
    value = newVal
    dispatch('change', value)
  }

  function onClick (choice: PopupMenuItem, idx: number) {
    return () => {
      update(choice.value)
      elements[idx].focus()
    }
  }

  function onKeyDown (choice: PopupMenuItem, idx: number) {
    return e => {
      if (modifierKey(e)) return
      if ((e.key === 'ArrowRight' || e.key === 'ArrowDown') && idx < choices.length - 1) {
        e.preventDefault()
        e.stopPropagation()
        update(choices[idx + 1].value)
        elements[idx + 1].focus()
      } else if ((e.key === 'ArrowLeft' || e.key === 'ArrowUp') && idx > 0) {
        e.preventDefault()
        e.stopPropagation()
        update(choices[idx - 1].value)
        elements[idx - 1].focus()
      }
    }
  }
</script>

{#if name}
  <input type="hidden" {name} {value}>
{/if}
<!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
<ul class="dialog-btn-group" class:disabled class:valid class:invalid aria-disabled={disabled} role="radiogroup" aria-labelledby={groupid} on:blur>
  {#each choices as choice, i (choice.value)}
    {@const selected = choice.value === value}
    <li bind:this={elements[i]} role="radio" class:selected aria-checked={selected} tabindex={selected ? 0 : -1} aria-controls={ariaControls} on:click={onClick(choice, i)} on:keydown={onKeyDown(choice, i)} on:blur aria-describedby="{groupid} {messagesid}">{choice.label || choice.value}</li>
  {/each}
</ul>

<style>
  .dialog-btn-group {
    display: flex;
    border-radius: 0.25em;
    border: 1px solid var(--dialog-btngrp-active-bg, #333333);
    overflow: hidden;
    padding: 0;
    margin: 0;
    list-style: none;
  }
  li {
    cursor: pointer;
    padding: 0.4em .8em;
    background-color: var(--dialog-btngrp-text, transparent);
    color: var(--dialog-btngrp-bg, inherit);
  }
  .selected {
    background-color: var(--dialog-btngrp-active-bg, #333333);
    color: var(--dialog-btngrp-active-text, white);
  }
</style>
