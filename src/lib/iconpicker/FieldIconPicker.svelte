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
  export let conditional: boolean|undefined = undefined
  export let helptext: string | undefined = undefined

  const labelid = randomid()
  const descid = randomid()

  let modalOpen: boolean = false
  let selected: { icon: string, prefix: string } = defaultValue

  const iconToPrefix: Record<string, string> = {}
  const categoriesToIcons = keyby(IconCategories, 'key')

  for (const icon of FontAwesomeIcons) {
    iconToPrefix[icon.class] = icon.free.indexOf('brands') > -1 ? 'fab' : 'fas'
  }

  const iconElements: HTMLDivElement[] = []

  let visibleIcons = FontAwesomeIcons

  let searchVal: string = ''
  let category: string = 'all'

  $:iconCountMessage = visibleIcons.length === FontAwesomeIcons.length ? 'Showing all icons' : `Showing ${visibleIcons.length} icons`

  function onSelectIcon (iconClass: string) {
    selected = { icon: iconClass, prefix: iconToPrefix[iconClass] }
  }

  function onSaveIconSelection (setVal: Function) {
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
      if (i.class.includes(searchVal)) return true
      for (const term of i.search.terms) {
        if (term.includes(searchVal)) return true
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
  <Icon icon={`${value.prefix === 'fab' ? 'fa-brands' : 'fa-solid'}:${value.icon.slice(3)}`}/>
  <button type="button" id="btnSelectIcon" on:click={() => { modalOpen = true }} aria-describedby={getDescribedBy([descid, messagesid, helptextid])}>Select New Icon</button>
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
              <label for="search_for" class="fa fa-search" rel="tooltip" title="search"></label>
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
            <div class="icon-picker-items" role="radiogroup">
              {#each visibleIcons as icon, idx (icon.class)}
                <div bind:this={iconElements[idx]} id={icon.class} class="icon-picker-item" role="radio" aria-checked={icon.class === selected.icon} tabindex={icon.class === selected.icon ? 0 : -1} data-index={idx} on:click={() => onSelectIcon(icon.class)}  on:keydown={onKeyDown}>
                  <Icon icon={`${iconToPrefix[icon.class] === 'fab' ? 'fa-brands' : 'fa-solid'}:${icon.class.slice(3)}`}/>
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
        <button type="button" aria-describedby="{labelid} {descid}" on:click={onSaveIconSelection(setVal)}>Save Changes</button>
      </footer>
    </section>
  </Modal>
{/if}
</FieldStandard>


<style>
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
      padding: 0px 0px 0px 30px;
      font-family: 'Nunito Sans', sans-serif !important;
  }

  #search_for + label{
      position: absolute;
      left: 7px;
      top: 7px;
      color: #999;
  }

  /* Styles for the icon picker grid */

  .icon-picker-items{
    margin-top: 5px;
    padding: 5px;
  }

.icon-picker-item {
    float: left;
    margin: 0px 11px 12px 11px;
    text-align: center;
    cursor: pointer;
    color: inherit;
    width: 10%;
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
