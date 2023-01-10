<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { modifierKey, type PopupMenuItem } from '@txstate-mws/svelte-components'
  import check from '@iconify-icons/mdi/check.js'
  import Icon from './Icon.svelte'
  const dispatch = createEventDispatcher()
  export let items: PopupMenuItem[] = []
  export let label: string
  export let multiselect: boolean = false
  export let selected: { value: string, label?: string }[] = []
  export let descid: string|undefined = undefined
  export let valid = false
  export let invalid = false

  import { randomid } from 'txstate-utils'
  const listId = randomid()
  const labelId = randomid()
  let listboxElement: HTMLElement
  let hilited: number | undefined = undefined
  let firstactive = 0
  let lastactive = items.length - 1
  const itemelements: HTMLElement[] = []
  $: selectedSet = new Set(selected.map(s => s.value))

  async function reactToItems (..._: any[]) {
    firstactive = items.findIndex(itm => !itm.disabled)
    lastactive = items.length - [...items].reverse().findIndex(itm => !itm.disabled) - 1
    hilited = undefined

    if (listboxElement) listboxElement.removeAttribute('aria-activedescendant')
  }
  $: reactToItems(items)

  const selectItem = (item: PopupMenuItem, index: number) => (e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (item.disabled) return
    listboxElement.setAttribute('aria-activedescendant', `${listId}-${index}`)
    hilited = index
    if (multiselect) {
      if (selectedSet.has(item.value)) {
        // remove it from selected
        selected = selected.filter(s => s.value !== item.value)
      } else {
        selected = [...selected, item]
      }
    } else {
      selected = [item]
    }
    dispatch('change', selected)
  }

  function move (idx: number) {
    if (items[idx]?.disabled) return
    hilited = Math.max(firstactive, Math.min(lastactive, idx))
    itemelements[hilited].scrollIntoView({ block: 'center' })
    listboxElement.setAttribute('aria-activedescendant', `${listId}-${hilited}`)
    if (!multiselect) {
      selected = [items[hilited]]
      dispatch('change', selected)
    }
  }

  function onkeydown (e: KeyboardEvent) {
    if (modifierKey(e)) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (items.length < 1) return
      let i = (hilited ?? firstactive - 1) + 1
      while (items[i]?.disabled) i++
      move(i)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (items.length < 1) return
      let i = (hilited ?? lastactive + 1) - 1
      while (items[i]?.disabled) i--
      move(i)
    } else if (e.key === ' ') {
      e.preventDefault()
      if (items.length < 1) return
      if (multiselect) {
        if (hilited != null) {
          if (selectedSet.has(items[hilited].value)) {
            // remove it from selected
            selected = selected.filter(s => s.value !== items[hilited!].value)
          } else {
            selected = [...selected, items[hilited]]
          }
          dispatch('change', selected)
        }
      }
    }
  }

  function focusListbox () {
    if (selected.length) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].value === selected[0].value) {
          hilited = i
          listboxElement.setAttribute('aria-activedescendant', `${listId}-${hilited}`)
        }
      }
    } else {
      hilited = firstactive
      listboxElement.setAttribute('aria-activedescendant', `${listId}-${hilited}`)
      if (!multiselect) {
        selected = [items[hilited]]
        dispatch('change', selected)
      }
    }
  }

</script>

<div class="listbox-container" class:valid class:invalid>
  <span id={labelId}>{label}</span>
  <ul bind:this={listboxElement} role="listbox" id={listId} class="listbox-items" tabindex="0" aria-describedby={descid} aria-labelledby={labelId} aria-multiselectable={multiselect} on:keydown={onkeydown} on:focus={focusListbox}>
    {#each items as item, i (item.value)}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <li
        bind:this={itemelements[i]}
        id={`${listId}-${i}`}
        role="option"
        class="listbox-item"
        class:hilited={hilited === i}
        class:disabled={!!item.disabled}
        aria-selected={selectedSet.has(item.value)}
        aria-disabled={item.disabled}
        on:click={selectItem(item, i)}
        >
        <span class:invisible={!multiselect || !selectedSet.has(item.value)}><Icon icon={check} width='0.8em'/></span>
        {item.label || item.value}
    </li>
    {/each}
  </ul>
</div>

<style>
  .listbox-container {
    width: 25%;
  }
  .listbox-items {
    list-style: none;
    padding-left: 0;
    border: 1px solid #666;
    height: 40vh;
    overflow-y: scroll;
  }
  .listbox-item {
    padding: 0.2em;
  }
  .listbox-item span.invisible {
    visibility: hidden;
  }
  .listbox-item.hilited {
    background-color: lightcyan;
  }
  .listbox-item.disabled {
    color: rgba(0,0,0,0.6);
  }
</style>
