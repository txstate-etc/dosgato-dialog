import { Store, derivedStore } from '@txstate-mws/svelte-store'
import type { ICropperStore } from './imagecropper'

export class ImageCropperStore extends Store<ICropperStore> {
  selection = derivedStore(this, 'selection')
  crop = derivedStore(this, 'crop')

  setSrc (src: string, imageWidth: number, imageHeight: number, selectionAspectRatio: number) {
    this.maximize(imageWidth, imageHeight, selectionAspectRatio)
    this.update(v => ({
      ...v,
      src
    }))
  }

  draw (left: number, top: number, width: number, height: number, imageWidth: number, imageHeight: number) {
    // calculate new values for crop
    const cropLeft = left / imageWidth
    const cropTop = top / imageHeight
    const cropRight = (left + width) / imageWidth
    const cropBottom = (top + height) / imageHeight
    this.update(v => ({
      ...v,
      selection: { ...v.selection, left, top, width, height, visible: true },
      crop: { imagecropleft: cropLeft, imagecroptop: cropTop, imagecropright: cropRight, imagecropbottom: cropBottom }
    }))
  }

  setCrop (cropLeft: number, cropTop: number, cropRight: number, cropBottom: number, imageWidth: number, imageHeight: number) {
    // calculate values for left, top, width, height
    const left = Math.round(cropLeft * imageWidth)
    const top = Math.round(cropTop * imageHeight)
    const cr = cropRight <= 0 ? 1 : cropRight
    const width = imageWidth * cr - left
    const cb = cropBottom <= 0 ? 1 : cropBottom
    const height = imageHeight * cb - top
    this.update(v => ({
      ...v,
      selection: { ...v.selection, left, top, width, height, visible: true, shieldVisible: true },
      crop: { imagecropleft: cropLeft, imagecroptop: cropTop, imagecropright: cropRight, imagecropbottom: cropBottom }
    }))
  }

  setTrack (track: boolean) {
    this.update(v => ({ ...v, selection: { ...v.selection, track } }))
  }

  setShieldVisibility (vis: boolean) {
    this.update(v => ({ ...v, selection: { ...v.selection, shieldVisible: vis } }))
  }

  setDrag (drag: boolean) {
    this.update(v => ({ ...v, selection: { ...v.selection, drag } }))
  }

  setSelectionVisibility (visible: boolean) {
    this.update(v => ({ ...v, selection: { ...v.selection, visible } }))
  }

  moveSelectionTo (left: number, top: number, imageWidth: number, imageHeight: number) {
    // calculate crop values using new left and right, current selection width and height
    const cropLeft = left / imageWidth
    const cropTop = top / imageHeight
    const cropRight = (left + this.value.selection.width) / imageWidth
    const cropBottom = (top + this.value.selection.height) / imageHeight
    this.update(v => ({
      ...v,
      selection: { ...v.selection, left, top },
      crop: { imagecropleft: cropLeft, imagecroptop: cropTop, imagecropright: cropRight, imagecropbottom: cropBottom }
    }))
  }

  maximize (imageWidth: number, imageHeight: number, selectionAspectRatio: number) {
    let cropLeft: number, cropRight: number, cropTop: number, cropBottom: number
    const imageAspectRatio = imageWidth / imageHeight
    if (imageAspectRatio > selectionAspectRatio) {
      const targetWidth = selectionAspectRatio * imageHeight
      cropLeft = (Math.round(imageWidth - targetWidth) / 2) / imageWidth
      cropTop = 0
      cropRight = ((Math.round(imageWidth - targetWidth) / 2) + targetWidth) / imageWidth
      cropBottom = 1
    } else {
      const targetHeight = imageWidth / selectionAspectRatio
      cropLeft = 0
      cropTop = (Math.round(imageHeight - targetHeight) / 2) / imageHeight
      cropRight = 1
      cropBottom = ((Math.round(imageHeight - targetHeight) / 2) + targetHeight) / imageHeight
    }
    this.setCrop(cropLeft, cropTop, cropRight, cropBottom, imageWidth, imageHeight)
    this.setSelectionVisibility(true)
    this.setShieldVisibility(true)
  }

  reset () {
    this.update(v => ({
      ...v,
      selection: {
        left: undefined,
        top: undefined,
        width: undefined,
        height: undefined,
        visible: false,
        shieldVisible: false,
        track: false,
        drag: false
      },
      crop: {
        imagecropbottom: 0,
        imagecropleft: 0,
        imagecropright: 0,
        imagecroptop: 0
      }
    }))
  }
}
