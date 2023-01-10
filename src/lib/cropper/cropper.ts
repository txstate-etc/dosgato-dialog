import { Store, derivedStore } from '@txstate-mws/svelte-store'
import { clone } from 'txstate-utils'

export interface CropOutput {
  left: number
  right: number
  top: number
  bottom: number
}

export interface CropSelectionPx {
  left: number
  top: number
  right: number
  bottom: number
}

export interface ICropperStore {
  // width in pixels of the drawing area
  // does not have to match the image but the aspect ratio should match the image
  width: number
  // height in pixels of the drawing area
  // does not have to match the image but the aspect ratio should match the image
  height: number
  // decimal, e.g. 16 / 9 = 1.777778
  targetAspect: number
  // percentage of image, ratio 0..1
  minSelection: number
  selection?: CropOutput

  cursor: 'crosshair' | 'move' | 'ew-resize' | 'ns-resize' | 'nesw-resize' | 'nwse-resize' | 'grabbing'
  drag?: {
    // coordinate in pixels where the mouse went down, relative to the drawing area
    // e.g. 0, 0 is the top left edge of the drawing area
    start: {
      x: number
      y: number
    }
    // if drag started inside the selection, we are adjusting the selection instead of making a new selection
    selection?: CropSelectionPx
    // if we are adjusting the selection, are we dragging one of the sides/corners?
    // up to two of these can be true, e.g. left: true, top: true means we are dragging the top left corner
    edge: {
      left: boolean
      right: boolean
      top: boolean
      bottom: boolean
    }
  }
}

const edgeSensitivity = 4
export class CropperStore extends Store<ICropperStore> {
  // coordinates of the selection edges relative to the top left of the draw area, in pixels
  // e.g. { left: 0, right: 10 } means the selection is 10 pixels wide
  selection = derivedStore(this, v => {
    return this.convertToPx(v.selection, v.width, v.height)
  })

  output = derivedStore(this, 'selection')

  constructor (initialValue: Omit<ICropperStore, 'cursor'>) {
    super({ ...initialValue, cursor: 'crosshair' })
  }

  setOutput (selection?: CropOutput) {
    this.update(v => ({ ...v, selection }))
  }

  updateDimensions (width: number, height: number) {
    this.update(v => ({ ...v, width, height }))
  }

  /**
   * The svelte component is responsible for making sure x and y are relative to the drawing area,
   * e.g. (0, 0) is the top left corner of the drawing area
   *
   * negative coordinates are not allowed
   */
  startDrag (x: number, y: number) {
    this.update(v => {
      const r = clone(v)
      const selection = this.convertToPx(r.selection, r.width, r.height)
      r.drag = { start: { x, y }, edge: { left: false, top: false, right: false, bottom: false } }
      if (selection) {
        r.drag.edge = {
          left: Math.abs(x - selection.left) < edgeSensitivity,
          top: Math.abs(y - selection.top) < edgeSensitivity,
          right: Math.abs(selection.right - x) < edgeSensitivity,
          bottom: Math.abs(selection.bottom - y) < edgeSensitivity
        }
        if (
          (r.drag.edge.left && r.drag.edge.top) ||
          (r.drag.edge.top && r.drag.edge.right) ||
          (r.drag.edge.right && r.drag.edge.bottom) ||
          (r.drag.edge.bottom && r.drag.edge.left) ||
          (
            x > selection.left && x < selection.right &&
            y > selection.top && y < selection.bottom
          )
        ) r.drag.selection = selection
      }
      return r
    })
  }

  endDrag () {
    this.update(v => ({ ...v, drag: undefined }))
  }

  reset () {
    this.update(v => ({ ...v, selection: undefined }))
  }

  maximize () {
    this.update(v => {
      const ar = v.width / v.height
      const s: CropOutput = {} as any
      if (ar > v.targetAspect) { // draw area is wider than aspect, fill height
        s.left = 100 * (ar - v.targetAspect) / (2 * ar)
        s.right = s.left
        s.top = 0
        s.bottom = 0
      } else { // draw area is taller than aspect, fill width
        s.left = 0
        s.right = 0
        s.top = 100 * (v.targetAspect - ar) / (2 * v.targetAspect)
        s.bottom = s.top
      }
      return { ...v, selection: s }
    })
  }

  convertToPct (sel: CropSelectionPx | undefined, width: number, height: number) {
    if (!sel) return undefined
    return {
      left: 100.0 * sel.left / width,
      right: 100.0 * (width - sel.right) / width,
      top: 100.0 * sel.top / height,
      bottom: 100.0 * (height - sel.bottom) / height
    }
  }

  convertToPx (output: CropOutput | undefined, width: number, height: number) {
    if (!output) return undefined
    return {
      left: output.left * width / 100.0,
      right: width - output.right * width / 100.0,
      top: output.top * height / 100.0,
      bottom: height - output.bottom * height / 100.0
    }
  }

  determineSelection (startX: number, startY: number, x: number, y: number, v: ICropperStore): CropSelectionPx {
    x = Math.min(v.width, Math.max(0, x))
    y = Math.min(v.height, Math.max(0, y))
    const dx = x - startX
    const dy = y - startY
    const dragar = Math.abs(dx / dy)
    if (dragar > v.targetAspect) { // too wide, dy is dominant
      const dragdx = Math.abs(dy * v.targetAspect)
      return {
        left: dx < 0 ? startX - dragdx : startX,
        right: dx < 0 ? startX : startX + dragdx,
        top: dy < 0 ? y : startY,
        bottom: dy < 0 ? startY : y
      }
    } else { // too tall, dx is dominant
      const dragdy = Math.abs(dx / v.targetAspect)
      return {
        left: dx < 0 ? x : startX,
        right: dx < 0 ? startX : x,
        top: dy < 0 ? startY - dragdy : startY,
        bottom: dy < 0 ? startY : startY + dragdy
      }
    }
  }

  /**
   * The svelte component is responsible for making sure x and y are relative to the drawing area,
   * e.g. (0, 0) is the top left corner of the drawing area
   *
   * negative coordinates are not allowed
   */
  mouseMove (x: number, y: number) {
    this.update(v => {
      const r = { ...v }
      if (v.drag) {
        let s: CropSelectionPx = {} as any
        const dx = x - v.drag.start.x
        const dy = y - v.drag.start.y
        if (v.drag.selection) { // adjust the selection
          r.cursor = 'grabbing'
          const old = v.drag.selection
          if (v.drag.edge.left && v.drag.edge.top) { // expanding
            s = this.determineSelection(v.drag.selection.right, v.drag.selection.bottom, x, y, v)
          } else if (v.drag.edge.left && v.drag.edge.bottom) { // expanding
            s = this.determineSelection(v.drag.selection.right, v.drag.selection.top, x, y, v)
          } else if (v.drag.edge.right && v.drag.edge.top) { // expanding
            s = this.determineSelection(v.drag.selection.left, v.drag.selection.bottom, x, y, v)
          } else if (v.drag.edge.right && v.drag.edge.bottom) { // expanding
            s = this.determineSelection(v.drag.selection.left, v.drag.selection.top, x, y, v)
          } else { // moving
            const maxdx = Math.max(Math.min(v.width - old.right, dx), -1 * old.left)
            const maxdy = Math.max(Math.min(v.height - old.bottom, dy), -1 * old.top)
            s.left = old.left + maxdx
            s.right = old.right + maxdx
            s.top = old.top + maxdy
            s.bottom = old.bottom + maxdy
          }
        } else { // drawing a new selection
          s = this.determineSelection(v.drag.start.x, v.drag.start.y, x, y, v)
        }
        return { ...r, selection: this.convertToPct(s, v.width, v.height) }
      } else {
        r.cursor = 'crosshair'
        if (r.selection) {
          const selection = this.convertToPx(r.selection, r.width, r.height)!
          const left = Math.abs(x - selection.left) < edgeSensitivity
          const top = Math.abs(y - selection.top) < edgeSensitivity
          const right = Math.abs(selection.right - x) < edgeSensitivity
          const bottom = Math.abs(selection.bottom - y) < edgeSensitivity
          const inside = x > selection.left && x < selection.right && y > selection.top && y < selection.bottom
          if ((left && top) || (right && bottom)) r.cursor = 'nwse-resize'
          else if ((right && top) || (left && bottom)) r.cursor = 'nesw-resize'
          else if (inside) r.cursor = 'move'
        }
      }
      return r
    })
  }

  move (dx: number, dy: number) {
    this.update(v => {
      if (!v.selection) return v
      const selection = this.convertToPx(v.selection, v.width, v.height)!
      if (dx < 0 && Math.abs(dx) > selection.left) dx = -1 * selection.left
      if (dx > 0 && dx > v.width - selection.right) dx = v.width - selection.right
      if (dy < 0 && Math.abs(dy) > selection.top) dy = -1 * selection.top
      if (dy > 0 && dy > v.height - selection.bottom) dy = v.height - selection.bottom
      selection.left += dx
      selection.right += dx
      selection.top += dy
      selection.bottom += dy
      return { ...v, selection: this.convertToPct(selection, v.width, v.height) }
    })
  }

  expand (type: 'tl' | 'tr' | 'bl' | 'br', by: number) {
    this.update(v => {
      if (!v.selection) return v
      const curr = this.convertToPx(v.selection, v.width, v.height)!
      const dx = by * v.targetAspect
      const dy = by / v.targetAspect
      let s: CropSelectionPx
      if (type === 'tl') s = this.determineSelection(curr.right, curr.bottom, curr.left - dx, curr.top - dy, v)
      else if (type === 'tr') s = this.determineSelection(curr.left, curr.bottom, curr.right + dx, curr.top - dy, v)
      else if (type === 'bl') s = this.determineSelection(curr.right, curr.top, curr.left - dx, curr.bottom + dy, v)
      else if (type === 'br') s = this.determineSelection(curr.left, curr.top, curr.right + dx, curr.bottom + dy, v)
      return { ...v, selection: this.convertToPct(s!, v.width, v.height) }
    })
  }
}
