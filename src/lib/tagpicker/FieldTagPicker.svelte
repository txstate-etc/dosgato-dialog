<script lang="ts">
  import FieldMultiselect from '$lib/FieldMultiselect.svelte'
  import { getContext } from 'svelte'
  import { isNotBlank } from 'txstate-utils'
  import { TAG_API_CONTEXT, type Tag, type TagClient, type TagGroup } from './TagAPI'

  export let path: string
  export let label: string
  export let target: any
  export let conditional: boolean | undefined = undefined
  export let required = false
  export let helptext: string | undefined = undefined
  export let emptyText: string | undefined = undefined
  /** Text to display in the tag picker input field when it's empty. */
  export let placeholder = ''

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
    return { label: (!tag.group.excludeTitle && isNotBlank(tag.group.title) ? tag.group.title + ': ' : '') + tag.name, value: tag.id }
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
</script>

<FieldMultiselect {path} {label} {getOptions} {lookupByValue} {conditional} {required} {helptext} {emptyText} {placeholder} />
