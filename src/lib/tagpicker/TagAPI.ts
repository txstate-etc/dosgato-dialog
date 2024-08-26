export const TAG_API_CONTEXT = {}

export interface Tag {
  id: string
  name: string
}

export interface TagGroup {
  id: string
  title?: string
  /**
   * The group title is not useful to disambiguate tag names, therefore it need not be prefixed onto
   * the tag name when the tag is removed from its group context.
   *
   * Example: when the group title is "Misc" or "Ungrouped", you probably don't want to see "Misc: MyTag",
   * you just want to see "MyTag"
   */
  excludeTitle?: boolean
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
