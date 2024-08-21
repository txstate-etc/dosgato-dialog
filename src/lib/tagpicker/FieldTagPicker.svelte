<script lang="ts">
  import FieldMultiselect from '$lib/FieldMultiselect.svelte'
  import { getContext } from 'svelte'
  import { TAG_API_CONTEXT, type Tag, type TagClient, type TagGroup } from './TagAPI'
    import { isNotBlank } from 'txstate-utils';

  export let path: string
  export let label: string
  export let target: any

  const tagClient = getContext<TagClient>(TAG_API_CONTEXT)

  let lasttarget: any = -1
  let groups: TagGroup[] = []
  let tags: (Tag & { lcname: string, group: TagGroup & { lctitle: string } })[]
  async function getOptions (search: string) {
    if (lasttarget !== target) {
      groups = await tagClient.availableForTarget(target)
      tags = groups.flatMap(g => g.tags.map(t => ({ ...t, lcname: t.name.toLocaleLowerCase(), group: { ...g, lctitle: g.title?.toLocaleLowerCase() ?? '' } })))
      lasttarget = target
    }
    const lcsearch = search?.toLocaleLowerCase() ?? ''
    return tags.filter(t => t.lcname.includes(lcsearch) || t.group.lctitle.includes(lcsearch)).map(t => ({ label: `${t.group.title ?? ''}${isNotBlank(t.group.title) ? ': ' : ''}${t.name}`, value: t.id }))
  }
</script>

<FieldMultiselect {path} {label} {getOptions} />
