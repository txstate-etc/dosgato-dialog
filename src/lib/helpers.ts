import { isNotBlank } from 'txstate-utils'

export function getDescribedBy (ids: string[]) {
  const descby = ids.filter(isNotBlank).join(' ')
  return isNotBlank(descby) ? descby : null
}
