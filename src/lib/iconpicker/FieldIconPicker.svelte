<script lang="ts">
  import FieldStandard from '../FieldStandard.svelte'
  import { ScreenReaderOnly, Modal, modifierKey } from '@txstate-mws/svelte-components'
  import { FontAwesomeIcons, IconCategories } from './iconpicker'
  import Icon from '@iconify/svelte'
  import { randomid, keyby } from 'txstate-utils'
  import { getDescribedBy } from '$lib/helpers'
  export let id: string | undefined = undefined
  export let path: string
  export let label: string = ''
  export let required = false
  export let defaultValue: { icon: string, prefix: string } = { icon: 'fa-graduation-cap', prefix: 'fas' }
  export let conditional: boolean | undefined = undefined
  export let helptext: string | undefined = undefined

  const labelid = randomid()
  const descid = randomid()

  let modalOpen: boolean = false
  let selected: { icon: string, prefix: string } = defaultValue

  const iconToPrefix: Record<string, string> = {}
  const categoriesToIcons = keyby(IconCategories, 'key')

  for (const icon of FontAwesomeIcons) {
    iconToPrefix[icon.class] = icon.free.includes('brands') ? 'fab' : 'fas'
  }

  const iconElements: HTMLDivElement[] = []

  let visibleIcons = FontAwesomeIcons

  let searchVal: string = ''
  let category: string = 'all'

  $:iconCountMessage = visibleIcons.length === FontAwesomeIcons.length ? 'Showing all icons' : `Showing ${visibleIcons.length} icons`

  function onSelectIcon (iconClass: string) {
    selected = { icon: iconClass, prefix: iconToPrefix[iconClass] }
  }

  function onSaveIconSelection (setVal: (val: any) => void) {
    return function () {
      setVal(selected)
      category = 'all'
      searchVal = ''
      visibleIcons = FontAwesomeIcons
      modalOpen = false
    }
  }

  function onCancel (val) {
    return function () {
      selected = val
      category = 'all'
      searchVal = ''
      visibleIcons = FontAwesomeIcons
      modalOpen = false
    }
  }


  function onSearch () {
    visibleIcons = FontAwesomeIcons.filter(i => {
      const searchValLC = searchVal.toLowerCase()
      if (i.class.toLowerCase().includes(searchValLC)) return true
      for (const term of i.search.terms) {
        if (term.toLowerCase().includes(searchValLC)) return true
      }
      return false
    })
    if (visibleIcons.findIndex(i => i.class === selected.icon) < 0) {
      onSelectIcon(visibleIcons[0].class)
    }
  }

  function onSelectCategory () {
    if (category === 'all') {
      visibleIcons = FontAwesomeIcons
    } else {
      visibleIcons = FontAwesomeIcons.filter(i => {
        return categoriesToIcons[category].icons.includes(i.class)
      })
    }
    if (visibleIcons.findIndex(i => i.class === selected.icon) < 0) {
      onSelectIcon(visibleIcons[0].class)
    }
  }

  function onKeyDown (e: KeyboardEvent) {
    const currentSelectionIndex = visibleIcons.findIndex(i => i.class === selected.icon)
    if (modifierKey(e)) return
    let newIndex
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault()
      if (currentSelectionIndex === visibleIcons.length - 1) {
        newIndex = 0
      } else {
        newIndex = currentSelectionIndex + 1
      }
      onSelectIcon(visibleIcons[newIndex].class)
      iconElements[newIndex].focus()
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      if (currentSelectionIndex === 0) {
        newIndex = visibleIcons.length - 1
      } else {
        newIndex = currentSelectionIndex - 1
      }
      onSelectIcon(visibleIcons[newIndex].class)
      iconElements[newIndex].focus()
    }
  }
</script>

<FieldStandard bind:id {path} {descid} {label} {required} {defaultValue} {conditional} {helptext} let:value let:valid let:invalid let:id let:onBlur let:setVal let:messagesid let:helptextid>
  <Icon icon={`${value.prefix === 'fab' ? 'fa6-brands' : 'fa6-solid'}:${value.icon?.slice(3) ?? 'graduation-cap'}`}/>
  <button type="button" {id} class="select-icon" on:click={() => { modalOpen = true }} aria-describedby={getDescribedBy([descid, messagesid, helptextid])} on:blur={onBlur}>Select New Icon</button>
  {#if modalOpen}
  <Modal>
    <section>
      <header id={labelid}>
        Select Icon
      </header>
      <div id={descid} class="content">
        <div class="icon-modal-content">
          <div class="filters">
            <div class="search-wrapper">
              <input bind:value={searchVal} id="search_for" placeholder="Search Icons" on:keyup={onSearch}/>
              <label for="search_for" class="fa fa-search" title="search"></label>
            </div>
            <select bind:value={category} class="icon-category" aria-label="Select Category" on:change={onSelectCategory}>
              <option value="all">All</option>
              {#each IconCategories as category (category.key)}
                <option value={category.key}>{category.label}</option>
              {/each}
            </select>
          </div>
          <fieldset>
            <ScreenReaderOnly><legend class="sr-only">Icons</legend></ScreenReaderOnly>
            <div class="icon-picker-items" role="radiogroup" class:empty={visibleIcons.length === 0}>
              {#each visibleIcons as icon, idx (icon.class)}

                <div bind:this={iconElements[idx]} id={icon.class} class="icon-picker-item" role="radio" aria-checked={icon.class === selected.icon} tabindex={icon.class === selected.icon ? 0 : -1} data-index={idx} on:click={() => onSelectIcon(icon.class)} on:keydown={onKeyDown}>
                  <Icon icon={`${iconToPrefix[icon.class] === 'fab' ? 'fa6-brands' : 'fa6-solid'}:${icon.class.slice(3)}`}/>
                  <ScreenReaderOnly>{icon.label}</ScreenReaderOnly>
                </div>
              {:else}
                <div id="no-icons">No Icons Found</div>
              {/each}
            </div>
            <ScreenReaderOnly arialive="polite">{iconCountMessage}</ScreenReaderOnly>
          </fieldset>
        </div>
      </div>
      <footer class="actions">
        <button type="button" aria-describedby="{labelid} {descid}" on:click={onCancel(value)}>Cancel</button>
        <button type="button" aria-describedby="{labelid} {descid}" on:click={onSaveIconSelection(setVal)}>Save</button>
      </footer>
    </section>
  </Modal>
{/if}
</FieldStandard>


<style>
  .select-icon {
    border-radius: 0.25em;
    border: 0px;
    background-color: var(--dg-button-bg, #501214);
    color: var(--dg-button-text, #fff);
    padding: 0.4em 1em;
    font-size: 0.8em;
  }
  section {
    position: relative;
    background-color: #f4f4f4;
    border-radius: 0.5em;
    padding: 1em;
    overflow: hidden;
    width: 75vw;
    min-width: 250px;
    max-width: 650px;
  }

  footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .icon-modal-content {
    display:flex;
    flex-direction: column;
    height: 100%;
  }

  .icon-modal-content .filters {
    display: flex;
    justify-content: center;
  }

  .icon-modal-content .filters select {
    width: 40%;
    margin: 10px 0 5px 0;
    height: 30px;
    border-radius: 10px;
    background-color: white;
    border: 1px solid #999;
    font-family: 'Nunito Sans', sans-serif !important;
  }

  .icon-modal-content fieldset {
    max-height: 75vh;
    overflow-y: scroll;
  }

  /* Styles for search field */

  .search-wrapper{
      position: relative;
      margin-top: 10px;
      margin-bottom: 5px;
      margin-right: 15px;
      align-self: center;
      width: 50%;
  }

  #search_for{
      width: 90%;
      border-radius: 10px;
      border: 1px solid #999;
      height: 30px;
      padding: 0.5em;
      font-family: 'Nunito Sans', sans-serif !important;
  }

  #search_for + label{
      position: absolute;
      left: 7px;
      top: 7px;
      color: #999;
  }

  /* Styles for the icon picker grid */

  .icon-picker-items {
    margin-top: 5px;
    padding: 5px;
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    row-gap: 1em;
    column-gap: 1em;
    justify-items: center;
    align-items: center;
  }
  .icon-picker-items.empty {
    display: block;
  }

  @media (max-width: 800px) {
    .icon-picker-items {
      grid-template-columns: repeat(5, 1fr);
    }
  }

  @media (max-width: 500px) {
    .icon-picker-items {
      grid-template-columns: repeat(4, 1fr);
    }
  }

.icon-picker-item {
    text-align: center;
    cursor: pointer;
    color: inherit;
    position: relative;
    font-size: 28px;
}

.icon-picker-item[aria-checked=true] {
  outline: 4px solid #93BBC4;
  background-color: #eee;
}

  /* Message when no icons are returned from search */
  #no-icons{
      margin-top: 10px;
      font-size: 1.5rem;
      text-align: center;
      vertical-align: middle;
      line-height: 250px;
      color: #999;
  }
</style>
