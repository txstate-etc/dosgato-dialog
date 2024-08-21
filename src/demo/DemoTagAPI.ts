import type { TagClient, TagGroup } from "$lib";

class DemoTagClient implements TagClient {
  async availableForTarget (target: any, publicTags?: boolean) {
    return [{
      id: 'ungrouped',
      title: '',
      tags: [
        { id: 'ungrouped-1', name: 'Blue' },
        { id: 'ungrouped-2', name: 'Red' },
        { id: 'ungrouped-3', name: 'Purple' },
        { id: 'ungrouped-4', name: 'Yellow' },
        { id: 'ungrouped-5', name: 'Teal' }
      ]
    }]
  }
}

export const demoTagClient = new DemoTagClient()
