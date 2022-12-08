export interface ImageCropperOutput {
  imagecropleft: number
  imagecropright: number
  imagecroptop: number
  imagecropbottom: number
}

export interface ICropSelection {
  left: number | undefined
  top: number | undefined
  width: number | undefined
  height: number | undefined
  visible: boolean
  shieldVisible: boolean
  track: boolean
  drag: boolean
}

export interface ICropperStore {
  selection: ICropSelection
  crop: ImageCropperOutput
}
