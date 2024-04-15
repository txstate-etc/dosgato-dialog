import alertCircleOutline from '@iconify-icons/mdi/alert-circle-outline'
import checkCircleOutline from '@iconify-icons/mdi/check-circle-outline'
import closeOctagonOutline from '@iconify-icons/mdi/close-octagon-outline'
import informationOutline from '@iconify-icons/mdi/information-outline'

export const messageIcons = {
  error: alertCircleOutline,
  warning: informationOutline,
  success: checkCircleOutline,
  system: closeOctagonOutline,
  info: informationOutline
}

export const messageLabels = {
  error: 'error',
  warning: 'warning',
  success: 'success',
  info: 'info',
  system: 'error'
} as const
