<script lang="ts">
  import { resize, ScreenReaderOnly } from '@txstate-mws/svelte-components'
  import { isNotBlank, randomid } from 'txstate-utils'
  import FieldStandard from '../FieldStandard.svelte'
  import { CropperStore, type CropOutput } from './cropper'

  export let id: string | undefined = undefined
  export let path: string
  export let imageSrc: string | undefined
  export let selectionAspectRatio: number = 1
  export let minSelection: number = 0 // percentage of image, a value 0-1
  export let label: string = ''
  export let required = false
  export let conditional: boolean | undefined = undefined
  export let helptext: string | undefined = undefined

  const store = new CropperStore({ width: 0, height: 0, minSelection, targetAspect: selectionAspectRatio })
  const { output, outputPct, selection } = store

  let setVal: (val: any) => void
  let value: CropOutput | undefined
  function init (spValue, spSetVal) {
    setVal = spSetVal
    value = spValue
  }

  $: store.setOutput(value)
  $: setVal?.($output)

  let rect: DOMRect
  function updateRect (..._: any) {
    if (!container) return false
    rect = container.getBoundingClientRect()
    store.updateDimensions(rect.width, rect.height)
    return true
  }

  function isInside (clientX, clientY) {
    return !(clientX < rect.left || clientX > rect.right || clientY > rect.bottom || clientY < rect.top)
  }

  function relativeToRect (clientX, clientY): [number, number] {
    return [Math.min(Math.max(0, clientX - rect.left), rect.width), Math.min(Math.max(0, clientY - rect.top), rect.height)]
  }

  let container: HTMLDivElement
  function onMouseDown (e: MouseEvent | TouchEvent) {
    if (!updateRect()) return
    if (window.TouchEvent && TouchEvent && e instanceof TouchEvent && e.touches.length > 1) return
    const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX
    const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY
    if (isInside(clientX, clientY)) {
      e.preventDefault()
      store.startDrag(clientX - rect.left, clientY - rect.top)
    }
  }

  function onMouseMove (e: MouseEvent | TouchEvent) {
    if (!updateRect()) return
    if (window.TouchEvent && e instanceof TouchEvent && e.touches.length > 1) return
    const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX
    const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY
    if (e instanceof MouseEvent && !e.buttons && $store.drag) store.endDrag()
    if (isInside(clientX, clientY) || $store.drag) store.mouseMove(...relativeToRect(clientX, clientY))
  }

  function onMouseUp (e: MouseEvent | TouchEvent) {
    if (!updateRect()) return
    store.endDrag()
    const clientX = e instanceof MouseEvent ? e.clientX : e.changedTouches[0].clientX
    const clientY = e instanceof MouseEvent ? e.clientY : e.changedTouches[0].clientY
    if (isInside(clientX, clientY)) {
      store.mouseMove(...relativeToRect(clientX, clientY))
      container?.querySelector<HTMLDivElement>('.selectionHilite')?.focus()
    }
  }

  function onMaximize () {
    if (!updateRect()) return
    store.maximize()
  }

  function onKeyDown (type: 'move' | 'tl' | 'tr' | 'bl' | 'br') {
    return (e: KeyboardEvent) => {
      const tl = type === 'tl'
      const tr = type === 'tr'
      const bl = type === 'bl'
      const br = type === 'br'
      const left = e.key === 'ArrowLeft'
      const right = e.key === 'ArrowRight'
      const up = e.key === 'ArrowUp'
      const down = e.key === 'ArrowDown'
      if (left || right || up || down) {
        e.preventDefault()
        e.stopPropagation()
      } else return
      const step = e.shiftKey ? (e.altKey || e.metaKey ? 80 : 20) : (e.altKey || e.metaKey ? 40 : 1)
      if (type === 'move') {
        store.move(left ? -1 * step : (right ? step : 0), up ? -1 * step : (down ? step : 0))
      } else {
        store.expand(type, ((tl || bl) && right) || ((tl || tr) && down) || ((tr || br) && left) || ((bl || br) && up) ? -1 * step : step)
      }
    }
  }

  $: updateRect(container)
  const descid = randomid()
  const movedescid = randomid()
  let focusWithin = false
</script>

<svelte:window on:mousemove={onMouseMove} on:mouseup={onMouseUp} on:touchend={onMouseUp} on:touchcancel={onMouseUp} />
<FieldStandard bind:id {label} {path} {required} conditional={conditional && isNotBlank(imageSrc)} {helptext} {descid} let:value let:setVal let:helptextid>
  {@const _ = init(value, setVal)}
  {#if isNotBlank(imageSrc)}
    <div on:focusin={() => { focusWithin = true }} on:focusout={() => { focusWithin = false }}>
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div bind:this={container} use:resize on:resize={() => updateRect()} class="crop-image-container" on:mousedown={onMouseDown} on:touchstart={onMouseDown} on:touchmove={onMouseMove} style:cursor={$store.cursor}>
        <img class="crop-image" src={imageSrc} alt="" />
        {#if $selection && $outputPct}
          <div class='crop-bg'>
            <img class='crop-image clipped' src={imageSrc} alt="" style:clip-path="polygon({$outputPct.left}% {$outputPct.top}%, {100 - $outputPct.right}% {$outputPct.top}%, {100 - $outputPct.right}% {100 - $outputPct.bottom}%, {$outputPct.left}% {100 - $outputPct.bottom}%, {$outputPct.left}% {$outputPct.top}%)" />
          </div>
          <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div class='selectionHilite' {id} tabindex="0" on:keydown={onKeyDown('move')}
            aria-labelledby={descid}
            aria-describedby="{movedescid} {helptextid ?? ''}"
            style:left="{$selection.left}px"
            style:top="{$selection.top}px"
            style:width="{$selection.right - $selection.left}px"
            style:height="{$selection.bottom - $selection.top}px"
          >
            <ScreenReaderOnly id={movedescid}>arrows move crop selection, hold shift and/or cmd/alt for bigger steps</ScreenReaderOnly>
            {#if focusWithin}
              <ScreenReaderOnly arialive="polite">top left x y coordinate is ({Math.round($selection.left)}, {Math.round($selection.top)}) bottom right x y coordinate is ({Math.round($selection.right)}, {Math.round($selection.bottom)})</ScreenReaderOnly>
              <ScreenReaderOnly arialive="polite">crop area is {Math.round($store.width)} pixels wide by {Math.round($store.height)} pixels tall</ScreenReaderOnly>
            {/if}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div class='selectionCorner tl'
              tabindex="0"
              on:keydown={onKeyDown('tl')}
            >
              <ScreenReaderOnly>arrows adjust crop size, bottom right is fixed, hold shift and/or cmd/alt for bigger steps</ScreenReaderOnly>
            </div>
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div class='selectionCorner tr'
              tabindex="0"
              on:keydown={onKeyDown('tr')}
            >
              <ScreenReaderOnly>arrows adjust crop size, bottom left is fixed, hold shift and/or cmd/alt for bigger steps</ScreenReaderOnly>
            </div>
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div class='selectionCorner bl'
              tabindex="0"
              on:keydown={onKeyDown('bl')}
            >
              <ScreenReaderOnly>arrows adjust crop size, top right is fixed, hold shift and/or cmd/alt for bigger steps</ScreenReaderOnly>
            </div>
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div class='selectionCorner br'
              tabindex="0"
              on:keydown={onKeyDown('br')}
            >
              <ScreenReaderOnly>arrows adjust crop size, top left is fixed, hold shift and/or cmd/alt for bigger steps</ScreenReaderOnly>
            </div>
          </div>
        {/if}
      </div>
      <div class="action-buttons">
        <button type="button" class='btn-center-max' on:click={onMaximize}>Center and Maximize</button>
        <button type="button" class='btn-clear' on:click={() => store.reset()}>Clear</button>
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
    user-select: none;
  }
  .crop-image {
    width: 100%;
    display: block;
    user-select: none;
  }
  .crop-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
  }
  .selectionHilite {
    position: absolute;
    border: 1px dashed white;
  }
  .selectionCorner {
    position: absolute;
    width: 10px;
    height: 10px;
  }
  .selectionCorner.tl {
    top: 0;
    left: 0;
  }
  .selectionCorner.tr {
    top: 0;
    right: 0;
  }
  .selectionCorner.bl {
    bottom: 0;
    left: 0;
  }
  .selectionCorner.br {
    bottom: 0;
    right: 0;
  }
</style>
