export const TAG_API_CONTEXT = {}

export interface Tag {
  id: string
  name: string
}

export interface TagGroup {
  id: string
  title?: string
  tags: Tag[]
}

export interface TagClient <TargetTypes = any> {
  availableForTarget: (
    target: TargetTypes,
    /**
     * true -> only public tags,
     * false -> only internal tags,
     * undefined -> all tags
     */
    publicTags?: boolean
  ) => Promise<TagGroup[]>
}
