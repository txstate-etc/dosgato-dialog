<!-- @component
  A Field component for dynamically rendering checkbox choices accross the available width of a `<div>`. If there are more
  choices than the available width of the `<div>` will support then it will create multiple rows to render within using
  flex. Ordering is top down by default but can be order horizontally by toggling `leftToRight`.
  The value of the field will be an array corresponding to the values of the checkboxes that are checked.

  Choices may optionally include a `group` property. When any choices have a group, they are rendered in fieldsets
  with the group string as the legend. Choices without a group render ungrouped. All choices still write to the
  same field path. `selectAll` adds a global select-all checkbox. `groupSelect` adds per-group select-all
  checkboxes. The two props are independent and can be used separately or together.
-->
<script lang="ts">
  import { getContext } from 'svelte'
  import { Field, FORM_CONTEXT, arraySerialize, FORM_INHERITED_PATH } from '@txstate-mws/svelte-forms'
  import type { FormStore } from '@txstate-mws/svelte-forms'
  import { derivedStore } from '@txstate-mws/svelte-store'
  import { isNotBlank, randomid, sortby } from 'txstate-utils'
  import { modifierKey, ScreenReaderOnly } from '@txstate-mws/svelte-components'
  import Container from './Container.svelte'
  import Checkbox from './Checkbox.svelte'
  import { getDescribedBy } from './helpers'

  let className = ''
  export { className as class }
  export let id: string | undefined = undefined
  export let path: string
  export let label = ''
  export let choices: { label?: string, value: any, disabled?: boolean, group?: string }[] | undefined
  export let defaultValue: any = []
  export let conditional: boolean | undefined = undefined
  export let maxwidth = 250
  export let leftToRight = false
  export let related: true | number = 0
  export let extradescid: string | undefined = undefined
  export let helptext: string | undefined = undefined
  export let selectAll = false
  export let groupSelect = false

  const store = getContext<FormStore>(FORM_CONTEXT)
  const inheritedPath = getContext<string>(FORM_INHERITED_PATH)
  const finalPath = [inheritedPath, path].filter(isNotBlank).join('.')
  const val = store.getField<any[]>(finalPath)
  const currentWidth = derivedStore(store, 'width')
  $: cols = Math.min(Math.ceil($currentWidth / maxwidth), choices?.length ?? 0)

  // Flat layout (used when no groups)
  let orders: number[]
  let width = '100%'
  function redoLayout (..._: any) {
    width = `${100 / cols}%`
    const rows = Math.ceil((choices?.length ?? 0) / cols)
    orders = choices?.map((_, i) => leftToRight ? i : Math.floor((i + 1) / cols) + rows * (i % cols)) ?? []
  }
  $: redoLayout(choices, cols)

  $: choiceOrder = new Map(choices?.map((c, i) => [c.value, i]) ?? [])

  function sortByChoiceOrder (values: any[]) {
    return sortby(values, v => choiceOrder.get(v) ?? 0)
  }

  function onChangeCheckbox (setVal: (val: any) => void, choice: NonNullable<typeof choices>[number], included: boolean) {
    setVal(v => {
      if (v == null) return included ? [] : [choice.value]
      if (included) return v.filter(s => s !== choice.value)
      else return sortByChoiceOrder([...v, choice.value])
    })
  }

  let selected = new Set<any>()
  function reactToValue (value: any[]) {
    selected = new Set(value ?? [])
  }
  $: reactToValue($val)

  // Grouping
  $: hasGroups = choices?.some(c => c.group) ?? false

  let groups: { name: string, items: { choice: NonNullable<typeof choices>[number], originalIndex: number }[] }[] = []
  let groupLayouts = new Map<string, { width: string, orders: number[] }>()

  function computeGroups (..._: any) {
    if (!hasGroups || !choices) { groups = []; return }
    // eslint-disable-next-line svelte/prefer-svelte-reactivity -- already handling reactivity (maintain svelte 4 compat)
    const map = new Map<string, typeof groups[number]['items']>()
    for (let i = 0; i < choices.length; i++) {
      const key = choices[i].group ?? ''
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push({ choice: choices[i], originalIndex: i })
    }
    groups = Array.from(map.entries()).map(([name, items]) => ({ name, items }))
  }
  $: computeGroups(choices, hasGroups)

  function computeGroupLayouts (..._: any) {
    // eslint-disable-next-line svelte/prefer-svelte-reactivity -- already handling reactivity (maintain svelte 4 compat)
    const layouts = new Map<string, { width: string, orders: number[] }>()
    const maxCols = Math.max(...groups.map(g => Math.min(Math.ceil($currentWidth / maxwidth), g.items.length)), 1)
    const w = `${100 / maxCols}%`
    for (const group of groups) {
      const count = group.items.length
      const rows = Math.ceil(count / maxCols)
      const ords = group.items.map((_, i) =>
        leftToRight ? i : Math.floor((i + 1) / maxCols) + rows * (i % maxCols)
      )
      layouts.set(group.name, { width: w, orders: ords })
    }
    groupLayouts = layouts
  }
  $: computeGroupLayouts(groups, $currentWidth)

  // Select all
  const selectAllId = randomid()

  $: selectAllChecked = choices?.every(choice => choice.disabled || selected.has(choice.value)) ?? false
  $: selectAllIndeterminate = !selectAllChecked && (choices?.some(choice => !choice.disabled && selected.has(choice.value)) ?? false)

  function selectAllChanged () {
    if (selectAllChecked) {
      void store.setField(finalPath, [])
    } else {
      void store.setField(finalPath, choices?.filter(choice => !choice.disabled).map(choice => choice.value) ?? [])
    }
  }

  // Per-group select all
  // selected must be passed explicitly so Svelte tracks it as a template dependency
  function isGroupAllChecked (items: typeof groups[number]['items'], sel: Set<any>): boolean {
    return items.length > 0 && items.every(item => item.choice.disabled || sel.has(item.choice.value))
  }

  function isGroupIndeterminate (items: typeof groups[number]['items'], sel: Set<any>): boolean {
    const enabledItems = items.filter(item => !item.choice.disabled)
    const selectedCount = enabledItems.filter(item => sel.has(item.choice.value)).length
    return selectedCount > 0 && selectedCount < enabledItems.length
  }

  function groupSelectChanged (items: typeof groups[number]['items']) {
    const allChecked = isGroupAllChecked(items, selected)
    const groupValues = items.filter(item => !item.choice.disabled).map(item => item.choice.value)
    if (allChecked) {
      const removing = new Set(groupValues)
      void store.setField(finalPath, [...selected].filter(v => !removing.has(v)))
    } else {
      // eslint-disable-next-line svelte/prefer-svelte-reactivity -- already handling reactivity (maintain svelte 4 compat)
      const newSelected = new Set(selected)
      for (const v of groupValues) newSelected.add(v)
      void store.setField(finalPath, sortByChoiceOrder(Array.from(newSelected)))
    }
  }

  // Roving tabindex - flat list of focusable checkbox DOM ids
  let focusableIds: string[] = []
  let activeId = ''
  const groupCheckboxIds: Record<string, string> = {}
  const groupLegendIds: Record<string, string> = {}

  function getGroupCheckboxId (groupName: string) {
    groupCheckboxIds[groupName] ??= randomid()
    return groupCheckboxIds[groupName]
  }

  function getGroupLegendId (groupName: string) {
    groupLegendIds[groupName] ??= randomid()
    return groupLegendIds[groupName]
  }

  function computeFocusables (..._: any) {
    const ids: string[] = []
    if (selectAll) ids.push(selectAllId)
    if (hasGroups) {
      for (const group of groups) {
        if (group.name && (selectAll || groupSelect)) ids.push(getGroupCheckboxId(group.name))
        for (const item of group.items) {
          if (!item.choice.disabled) ids.push(`${finalPath}.${item.originalIndex}`)
        }
      }
    } else {
      for (let i = 0; i < (choices?.length ?? 0); i++) {
        if (!choices![i].disabled) ids.push(`${finalPath}.${i}`)
      }
    }
    focusableIds = ids
    if (!activeId || !ids.includes(activeId)) {
      activeId = ids[0] ?? ''
    }
  }
  $: computeFocusables(choices, groups, hasGroups, selectAll, groupSelect)

  function onKeydown (e: KeyboardEvent) {
    if (modifierKey(e)) return
    let direction = 0
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') direction = -1
    else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') direction = 1
    if (!direction) return
    e.preventDefault()
    const idx = focusableIds.indexOf(activeId)
    const next = idx + direction
    if (next >= 0 && next < focusableIds.length) {
      activeId = focusableIds[next]
      document.getElementById(activeId)?.focus()
    }
  }

  function tabindexFor (domId: string): number {
    return activeId === domId ? 0 : -1
  }

  const descid = randomid()
</script>

<Field {path} {defaultValue} allowedValues={choices?.map(choice => choice.value)} allowedValuesMultiple {conditional} let:path={fullpath} let:value let:onBlur let:setVal let:messages let:valid let:invalid serialize={arraySerialize}>
  <Container path={fullpath} {id} {label} {messages} {descid} {related} {helptext} let:messagesid let:helptextid>
    <div class="dialog-choices {className}" class:valid class:invalid role="listbox" aria-multiselectable={true} aria-label={label}>
      {#if selectAll}
        <label for={selectAllId} style:width={hasGroups ? '100%' : width}>
          <Checkbox id={selectAllId} name={selectAllId} value={selectAllChecked} indeterminate={selectAllIndeterminate} onChange={selectAllChanged} {onKeydown} tabindex={tabindexFor(selectAllId)} />
          <span>Select All</span>
        </label>
      {/if}
      {#if hasGroups}
        {#each groups as group (group.name)}
          {@const layout = groupLayouts.get(group.name)}
          {#if group.name}
            {@const groupLegendId = getGroupLegendId(group.name)}
            <div class="dialog-choices-group">
              {#if selectAll || groupSelect}
                {@const groupCkId = getGroupCheckboxId(group.name)}
                <label class="dialog-choices-group-header">
                  <Checkbox id={groupCkId} name="group-{group.name}" value={isGroupAllChecked(group.items, selected)} indeterminate={isGroupIndeterminate(group.items, selected)} onChange={() => groupSelectChanged(group.items)} {onKeydown} tabindex={tabindexFor(groupCkId)} />
                  <span id={groupLegendId}><ScreenReaderOnly>Select all </ScreenReaderOnly>{group.name}</span>
                </label>
              {:else}
                <div class="dialog-choices-group-header" id={groupLegendId}>{group.name}</div>
              {/if}
              <div class="dialog-choices-items">
                {#each group.items as item, groupIdx (item.choice.value)}
                  {@const checkid = `${fullpath}.${item.originalIndex}`}
                  {@const included = value?.includes(item.choice.value)}
                  {@const choiceLabel = item.choice.label || (typeof item.choice.value === 'string' ? item.choice.value : '')}
                  <label for={checkid} style:width={layout?.width} style:order={layout?.orders[groupIdx]}>
                    <Checkbox id={checkid} name={checkid} value={included} descid={getDescribedBy([groupLegendId, descid, messagesid, helptextid, extradescid])} disabled={item.choice.disabled} onChange={() => onChangeCheckbox(setVal, item.choice, included)} {onBlur} {onKeydown} tabindex={tabindexFor(checkid)} />
                    <span>{choiceLabel}</span>
                  </label>
                {/each}
              </div>
            </div>
          {:else}
            <div class="dialog-choices-items">
              {#each group.items as item, groupIdx (item.choice.value)}
                {@const checkid = `${fullpath}.${item.originalIndex}`}
                {@const included = value?.includes(item.choice.value)}
                {@const choiceLabel = item.choice.label || (typeof item.choice.value === 'string' ? item.choice.value : '')}
                <label for={checkid} style:width={layout?.width} style:order={layout?.orders[groupIdx]}>
                  <Checkbox id={checkid} name={checkid} value={included} descid={getDescribedBy([descid, messagesid, helptextid, extradescid])} disabled={item.choice.disabled} onChange={() => onChangeCheckbox(setVal, item.choice, included)} {onBlur} {onKeydown} tabindex={tabindexFor(checkid)} />
                  <span>{choiceLabel}</span>
                </label>
              {/each}
            </div>
          {/if}
        {/each}
      {:else}
        {#each choices as choice, idx (choice.value)}
          {@const checkid = `${fullpath}.${idx}`}
          {@const included = value?.includes(choice.value)}
          {@const label = choice.label || (typeof choice.value === 'string' ? choice.value : '')}
          <label for={checkid} style:width style:order={orders[idx]}>
            <Checkbox id={checkid} name={checkid} value={included} descid={getDescribedBy([descid, messagesid, helptextid, extradescid])} disabled={choice.disabled} onChange={() => onChangeCheckbox(setVal, choice, included)} {onBlur} {onKeydown} tabindex={tabindexFor(checkid)} />
            <span>{label}</span>
          </label>
        {/each}
      {/if}
    </div>
  </Container>
</Field>

<style>
  .dialog-choices {
    display: flex;
    flex-wrap: wrap;
  }
  label {
    margin-bottom: 0.7em;
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }
  span {
    margin-left: 0.45em;
    max-width: calc(100% - 1.6em);
  }
  label :global(input[type="checkbox"]) {
    transform: none;
  }
  .dialog-choices-group {
    padding: 0;
    margin: 0 0 0.3em 0;
    width: 100%;
  }
  .dialog-choices-group-header {
    font-weight: 600;
    margin-bottom: 0.3em;
  }
  .dialog-choices-items {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    padding-left: 1.5em;
  }
</style>
