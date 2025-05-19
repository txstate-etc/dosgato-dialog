import type { TagClient, TagGroup } from "$lib";

class DemoTagClient implements TagClient {
  async availableForTarget (target: any, publicTags?: boolean) {
    return [{
      id: 'ungrouped',
      title: 'Colors',
      tags: [
        { id: 'ungrouped-1', name: 'Blue' },
        { id: 'ungrouped-2', name: 'Red' },
        { id: 'ungrouped-3', name: 'Purple' },
        { id: 'ungrouped-4', name: 'Yellow' },
        { id: 'ungrouped-5', name: 'Teal' }
      ],
      excludeTitle: true
    },
    {
      id: 'ungrouped1',
      title: 'Sizes',
      tags: [
        { id: 'ungrouped1-1', name: 'Small' },
        { id: 'ungrouped1-2', name: 'Medium' },
        { id: 'ungrouped1-3', name: 'Large' }
      ],
      excludeTitle: true
    }]
  }
}

export const demoTagClient = new DemoTagClient()
