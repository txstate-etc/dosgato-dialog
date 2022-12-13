<script lang="ts">
  import { isNotBlank, isNotNull } from 'txstate-utils'
  import FieldStandard from '../FieldStandard.svelte'
  import { ImageCropperStore } from './ImageCropperStore'
  import type { ICropperStore } from './imagecropper'

  export let id: string | undefined = undefined
  export let path: string
  export let imageSrc: string
  export let selectionAspectRatio: number = 1
  export let minSelection: number = 0 // percentage of image, a value 0-1
  export let snapDistance: number = 0
  export let label: string = ''
  export let required = false
  export let conditional: boolean|undefined = undefined
  export let helptext: string | undefined = undefined

  interface Point {
    x: number
    y: number
  }

  let minSelectionWidth: number = 0
  let minSelectionHeight: number = 0
  let localCoord: Point | null = null
  const oldGlobalCoord: Point = { x: 0, y: 0 }
  let initialGlobalCoord = null
  let globalOffsetX: number = 0
  let globalOffsetY: number = 0
  let initialGlobalDragCoord: Point | null = null
  let initialDragLeft: number = 0
  let initialDragTop: number = 0
  let altKey: boolean = false
  let ctrlKey: boolean = false
  const pseudoEvent: any = { clientX: 0, clientY: 0 }

  let shieldDiv: HTMLDivElement
  let image: HTMLImageElement

  function widthPercent (val: number) {
    return val / imageWidth * 100
  }

  function heightPercent (val: number) {
    return val / imageHeight * 100
  }

  const defaultSelection: ICropperStore = {
    src: '',
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
      imagecropbottom: 0, // TODO: better default values?
      imagecropleft: 0,
      imagecropright: 0,
      imagecroptop: 0
    }
  }

  let imageWidth: number
  let imageHeight: number

  $: imageAspectRatio = imageWidth / imageHeight
  $: maxContainerWidth = ((image && imageWidth > 0 && imageHeight > 0) ? Math.min(image.width, 700) : '700')
  $: store.setSrc(imageSrc, imageWidth, imageHeight, selectionAspectRatio)

  const store = new ImageCropperStore(defaultSelection)
  const { selection, crop } = store

  function startSelection (e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (e.altKey) altKey = e.altKey
    if (e.ctrlKey) ctrlKey = e.ctrlKey
    if (!$selection.visible) {
      localCoord = { x: e.offsetX + 1, y: e.offsetY + 1 }
      initialGlobalCoord = { x: e.clientX, y: e.clientY }
      oldGlobalCoord.x = e.clientX
      oldGlobalCoord.y = e.clientY
      let selectionWidth = 0
      let selectionHeight = 0
      if (minSelection > 0) {
        if (imageAspectRatio > selectionAspectRatio) {
          // use height for min selection calculation
          selectionHeight = imageHeight * minSelection
          selectionWidth = (16.0 * selectionHeight) / 9.0 // TODO: Why is this assuming a 16:9 ratio? That's how it's working Gato, but probably isn't right.
        } else {
          // use width for min selection calculation
          selectionWidth = imageWidth * minSelection
          selectionHeight = (9.0 * selectionWidth) / 16.0
        }
        minSelectionWidth = selectionWidth
        minSelectionHeight = selectionHeight
      }
      store.draw(e.offsetX, e.offsetY, selectionWidth, selectionHeight, imageWidth, imageHeight)
      store.setTrack(true)
    }
  }

  function adjustInitialSelection (e: MouseEvent, setVal: any) {
    // Getting position and size.
    if (altKey) {
      // Pressing alt allows the user to move the selection while creating it.
      globalOffsetX += e.clientX - oldGlobalCoord.x
      globalOffsetY += e.clientY - oldGlobalCoord.y
    }
    // If the user moved the mouse from right to left instead of left to right
    const invertedHor = e.clientX - (initialGlobalCoord.x + globalOffsetX) < 0
    // If the user moved the mouse from bottom to top instead of top to bottom
    const invertedVer = e.clientY - (initialGlobalCoord.y + globalOffsetY) < 0
    let width = Math.abs(e.clientX - (initialGlobalCoord.x + globalOffsetX))
    let height = Math.abs(e.clientY - (initialGlobalCoord.y + globalOffsetY))
    let left = localCoord.x + globalOffsetX
    let top = localCoord.y + globalOffsetY
    if (invertedHor) left -= width
    if (invertedVer) top -= height

    const leftEdge = left
    if (leftEdge < 0 || (leftEdge <= snapDistance && !ctrlKey)) {
      width += leftEdge
      left = 0
    }
    const topEdge = top
    if (topEdge < 0 || (topEdge <= snapDistance && !ctrlKey)) {
      height += topEdge
      top = 0
    }
    const rightEdge = imageWidth - width - left
    if (rightEdge < 0 || (rightEdge <= snapDistance && !ctrlKey)) width += rightEdge
    const bottomEdge = imageHeight - height - top
    if (bottomEdge < 0 || (bottomEdge <= snapDistance && !ctrlKey)) height += bottomEdge

    if (width > selectionAspectRatio * height) {
      if (invertedHor) left += width - selectionAspectRatio * height
      width = selectionAspectRatio * height
    } else {
      if (invertedVer) top += height - width / selectionAspectRatio
      height = width / selectionAspectRatio
    }

    if (width < minSelectionWidth || height < minSelectionHeight) {
      width = minSelectionWidth
      height = minSelectionHeight
    }
    store.draw(left, top, width, height, imageWidth, imageHeight)
    setVal($crop)
  }

  function onMouseUp (setVal: any) {
    return (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.altKey) altKey = e.altKey
      if (e.ctrlKey) ctrlKey = e.ctrlKey
      if ($selection.track) {
        if (initialGlobalCoord.x === e.clientX && initialGlobalCoord.y === e.clientY) {
          reset(setVal)
        } else {
          adjustInitialSelection(e, setVal)
          store.setShieldVisibility(true)
          oldGlobalCoord.x = e.clientX
          oldGlobalCoord.y = e.clientY
        }
      } else if (e.target === shieldDiv || e.target === image) {
        reset(setVal)
      }
      store.setTrack(false)
      store.setDrag(false)
    }
  }

  function onMouseMove (setVal: any) {
    return (e: MouseEvent) => {
      if (e.altKey) altKey = e.altKey
      if (e.ctrlKey) ctrlKey = e.ctrlKey
      if ($selection.track || $selection.drag) {
        e.preventDefault()
        pseudoEvent.clientX = e.clientX
        pseudoEvent.clientY = e.clientY
        if ($selection.track) adjustInitialSelection(pseudoEvent, setVal)
        else if ($selection.drag) adjustSelectionDrag(pseudoEvent, setVal)
        oldGlobalCoord.x = e.clientX
        oldGlobalCoord.y = e.clientY
      }
    }
  }

  function startDragSelection (e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (e.altKey) altKey = e.altKey
    if (e.ctrlKey) ctrlKey = e.ctrlKey
    initialGlobalDragCoord = { x: e.clientX, y: e.clientY }
    initialDragLeft = $selection.left
    initialDragTop = $selection.top
    store.setDrag(true)
  }

  function onKey (e: KeyboardEvent, setVal: any) {
    altKey = e.altKey
    ctrlKey = e.ctrlKey
    if ($selection.track || $selection.drag) {
      e.preventDefault()
      pseudoEvent.preventDefault = function () { }
      pseudoEvent.clientX = oldGlobalCoord.x
      pseudoEvent.clientY = oldGlobalCoord.y
      pseudoEvent.altKey = e.altKey
      pseudoEvent.ctrlKey = e.ctrlKey
    }
    if ($selection.track) adjustInitialSelection(pseudoEvent, setVal)
    else if ($selection.drag) onMouseMove.call(pseudoEvent, setVal)
  }


  function onKeyDown (setVal: any) {
    return (e: KeyboardEvent) => {
      if ((!altKey && e.altKey) || (!ctrlKey && e.ctrlKey)) onKey(e, setVal)
    }
  }

  function onKeyUp (setVal: any) {
    return (e: KeyboardEvent) => {
      if ((!altKey && e.altKey) || (!ctrlKey && e.ctrlKey)) onKey(e, setVal)
    }
  }

  function adjustSelectionDrag (e: MouseEvent, setVal: any) {
    let left = initialDragLeft + e.clientX - initialGlobalDragCoord.x
    let top = initialDragTop + e.clientY - initialGlobalDragCoord.y

    // Adjusting position to account for edge snapping
    const leftEdge = left
    if (leftEdge < 0 || (leftEdge <= snapDistance && !ctrlKey)) left = 0
    const topEdge = top
    if (topEdge < 0 || (topEdge <= snapDistance && !ctrlKey)) top = 0
    const rightEdge = imageWidth - $selection.width - left
    if (rightEdge < 0 || (rightEdge <= snapDistance && !ctrlKey)) left += rightEdge
    const bottomEdge = imageHeight - $selection.height - top
    if (bottomEdge < 0 || (bottomEdge <= snapDistance && !ctrlKey)) top += bottomEdge
    store.moveSelectionTo(left, top, imageWidth, imageHeight)
    setVal($crop)
  }

  function maximize (setVal: any) {
    store.maximize(imageWidth, imageHeight, selectionAspectRatio)
    setVal($crop)
  }

  function reset (setVal: any) {
    localCoord = null
    initialGlobalCoord = null
    store.reset()
    setVal($crop)
    altKey = false
    ctrlKey = false
  }

  let storeInitialized = false
  function init (value, setVal) {
    if (!storeInitialized && imageWidth > 0 && imageHeight > 0) {
      if (value) {
        store.setCrop(value.imagecropleft, value.imagecroptop, value.imagecropright, value.imagecropbottom, imageWidth, imageHeight)
      } else {
        store.maximize(imageWidth, imageHeight, selectionAspectRatio)
        setVal($crop)
      }
      storeInitialized = true
    }
  }
</script>

<FieldStandard bind:id {label} {path} {required} {conditional} {helptext} let:value let:setVal>
  {#if isNotBlank(imageSrc)}
    {@const _ = init(value, setVal)}
    <div class="cropper-wrapper">
      <div class="crop-image-container" on:mousedown={startSelection} on:mouseup={onMouseUp(setVal)} on:mousemove={onMouseMove(setVal)} on:keydown={onKeyDown(setVal)} on:keyup={onKeyUp(setVal)} bind:clientWidth={imageWidth} bind:clientHeight={imageHeight} style="max-width: {maxContainerWidth}px">
        <img bind:this={image} class="crop-image" src={imageSrc} alt=""/>
        <div class='selectionLine divSelectionHor divSelectionTop' class:visible={$selection.visible} style={isNotNull($selection.left) ? `left: ${$selection.left}px; top: ${$selection.top}px; width: ${$selection.width}px` : ''}></div>
        <div class='selectionLine divSelectionVer divSelectionRight' class:visible={$selection.visible} style={isNotNull($selection.left) ? `left: ${$selection.left + $selection.width - 1}px; top: ${$selection.top}px; height: ${$selection.height}px` : ''}></div>
        <div class='selectionLine divSelectionHor divSelectionBottom' class:visible={$selection.visible} style={isNotNull($selection.left) ? `left: ${$selection.left}px; top: ${$selection.top + $selection.height - 1}px; width: ${$selection.width}px` : ''}></div>
        <div class='selectionLine divSelectionVer divSelectionLeft' class:visible={$selection.visible} style={isNotNull($selection.left) ? `left: ${$selection.left}px; top: ${$selection.top}px; height: ${$selection.height}px` : ''}></div>
        <img src="{imageSrc}" class='imageCropSelection' alt="" class:visible={$selection.visible} style={isNotNull($selection.left) ? `clip-path: polygon(${widthPercent($selection.left)}% ${heightPercent($selection.top)}%, ${widthPercent($selection.left + $selection.width)}% ${heightPercent($selection.top)}%, ${widthPercent($selection.left + $selection.width)}% ${heightPercent($selection.top + $selection.height)}%, ${widthPercent($selection.left)}% ${heightPercent($selection.top + $selection.height)}%)` : ''} on:mousedown={startDragSelection}/>
        <div bind:this={shieldDiv} class="divShield" class:visible={$selection.shieldVisible} ></div>
      </div>
      <div class="action-buttons">
        <button class='btn-center-max' on:click={() => maximize(setVal)}>Center and Maximize</button>
        <button class='btn-clear' on:click={() => reset(setVal)}>Clear</button>
      </div>
      <div class="cropper-instructions">
        Click and drag to select a section of your image to use.
      </div>
    </div>
  {:else}
    Image not selected
  {/if}
</FieldStandard>

<style>
  .crop-image-container {
    position: relative;
  }
  .crop-image-container .crop-image {
    max-width: 100%;
    max-height: 100%;
    z-index: 3;
    cursor: crosshair;
    display: block;
    position: relative;
  }

  .selectionLine {
    visibility: hidden;
  }
  .selectionLine.visible {
    visibility: visible;
  }
  .imageCropSelection {
    visibility: hidden;
  }
  .imageCropSelection.visible {
    visibility: visible;
  }
  .imageCropSelection {
    position: absolute;
    top: 0;
    left: 0;
    display: block;
    z-index: 9;
    visibility: hidden;
    overflow: hidden;
    max-width:100%;
    max-height: 100%;
}
  .divShield {
    position:       absolute;
    left:           0;
    top:            0;
    background:     #000;
    z-index:        4;
    cursor:         default;
    visibility:     hidden;
    filter:         opacity(80%);
    opacity:        0.8;
    width: 100%;
    height: 100%;
  }
  .divShield.visible {
    visibility: visible;
  }

.divSelectionHor {
    position:       absolute;
    left:           0;
    top:            0;
    width:          1px;
    height:         1px;
    font:           1px/1px verdana, sans-serif;
    background:     repeating-linear-gradient(to right, #000, #000 5px, white 5px, transparent 10px);
    z-index:        10;
    cursor:         crosshair;
    visibility:     hidden;
}
.divSelectionVer {
    position:       absolute;
    left:           0;
    top:            0;
    width:          1px;
    height:         1px;
    font:           1px/1px verdana, sans-serif;
    background:     repeating-linear-gradient(to bottom, #000, #000 5px, white 5px, transparent 10px);
    z-index:        10;
    cursor:         crosshair;
    visibility:     hidden;
}
</style>