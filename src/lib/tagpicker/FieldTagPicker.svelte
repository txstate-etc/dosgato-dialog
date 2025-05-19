<script lang="ts">
  import FieldMultiselect from '$lib/FieldMultiselect.svelte'
  import { getContext } from 'svelte'
  import { isNotBlank } from 'txstate-utils'
  import { TAG_API_CONTEXT, type Tag, type TagClient, type TagGroup } from './TagAPI'
  import trashIcon from '@iconify-icons/ph/trash-simple-fill'
  import { Icon } from '$lib';
  import type { PopupMenuItem } from '@txstate-mws/svelte-components'

  export let path: string
  export let label: string
  export let target: any
  export let conditional: boolean | undefined = undefined
  export let required = false
  export let extradescid: string | undefined = undefined
  export let helptext: string | undefined = undefined
  export let emptyText: string | undefined = undefined
  /** Text to display in the tag picker input field when it's empty. */
  export let placeholder = ''
  /** We might want to show the title in the dialog for clarity, even if it is excluded when rendering tags on a page. */
  export let showTitleInDialog = false
  export let menuContainerClass = ''
  export let menuClass = ''
  export let menuItemClass = 'default-menu-item'
  export let menuItemHilitedClass = ''
  export let menuCategoryClass = 'default-menu-category'

  const tagClient = getContext<TagClient>(TAG_API_CONTEXT)

  let lasttarget: any = -1
  let groups: TagGroup[] = []
  let tags: (Tag & { lcname: string, group: TagGroup & { lctitle: string } })[]
  async function fetchAvailableTags () {
    if (lasttarget !== target) {
      groups = await tagClient.availableForTarget(target)
      tags = groups.flatMap(g => g.tags.map(t => ({ ...t, lcname: t.name.toLocaleLowerCase(), group: { ...g, lctitle: g.title?.toLocaleLowerCase() ?? '' } })))
      lasttarget = target
    }
  }

  function tagToOption (tag: (typeof tags)[0]) {
    let group: string | undefined = undefined
    if (isNotBlank(tag.group.title) && (showTitleInDialog || !tag.group.excludeTitle)) {
      group = tag.group.title
    }
    return { label: tag.name, value: tag.id, group }
  }

  async function getOptions (search: string) {
    await fetchAvailableTags()
    const lcsearch = search?.toLocaleLowerCase() ?? ''
    return tags.filter(t => t.lcname.includes(lcsearch) || t.group.lctitle.includes(lcsearch)).map(tagToOption)
  }

  async function lookupByValue (id: string) {
    await fetchAvailableTags()
    const tag = tags.find(t => t.id === id)
    if (!tag) return undefined
    return tagToOption(tag)
  }

  function selectedItemLabel (item: PopupMenuItem) {
    const tag = item.label ?? item.value
    return item.group ? `${item.group}: ${tag}` : tag
  }


</script>

<FieldMultiselect {path} {label} {getOptions} {lookupByValue} {conditional} {required} {extradescid} {helptext} {emptyText} {placeholder} {menuClass} {menuContainerClass} {menuItemClass} {menuItemHilitedClass} {menuCategoryClass} selectedItemLabel={showTitleInDialog ? selectedItemLabel : undefined} includeDeleteAll confirmDelete="Are you sure you want remove all tag selections?">
  <svelte:fragment slot="deleteall"><span class="delete-button-text">Delete All <Icon icon={trashIcon}/></span></svelte:fragment>
</FieldMultiselect>

<style>
  :global(span.default-menu-category) {
    padding: 0.5em;
    border-bottom: 1px solid #767676;
    margin: 0 -0.4em;
  }
  :global(.defaultmenu .group.group ul:has(.default-menu-item)) {
    padding-inline-start: 0;
  }
  :global(li.default-menu-item) {
    margin: 0 -0.4em;
    padding: 0.5em;
    border-bottom: 1px solid #767676;
  }
  :global(.defaultmenu .group li.default-menu-item) {
    padding-left: 1.25em;
  }
  :global(li.default-menu-item):hover {
    background-color: var(--dg-dialog-header-bg, #DDDDDD);
  }
  .delete-button-text {
    font-size: 0.75em;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5em;
  }
  .delete-button-text :global(svg) {
    color: #9A3332;
  }
  :global(button):has(.delete-button-text) {
    background-color: transparent;
    border: 0;
  }
</style>
