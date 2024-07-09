<script lang="ts">
  import { isNotBlank, randomid } from 'txstate-utils'
  import FieldStandard from '../FieldStandard.svelte'
  import Button from '../Button.svelte'
  import arrowsIn from '@iconify-icons/ph/arrows-in'
  import { Dialog, type ImagePositionOutput } from '$lib'
  import { modifierKey, ScreenReaderOnly } from '@txstate-mws/svelte-components'

  export let id: string | undefined = undefined
  export let path: string
  export let imageSrc: string | undefined
  export let label: string = ''
  export let required = false
  export let conditional: boolean | undefined = undefined
  export let helptext: string | undefined = undefined
  export let info: string | undefined = undefined
  export let defaultValue: ImagePositionOutput = { x: 50, y: 50 }

  let initialVal: ImagePositionOutput
  function init (v) {
    if (v) {
      initialVal = v
    } else {
      initialVal = defaultValue
    }
  }

  const boxes: HTMLDivElement[] = []

  const descid = randomid()
  const labelid = randomid()
  let modalOpen: boolean = false

  function showModal () {
    modalOpen = true
  }

  function hideModal () {
    modalOpen = false
  }

  let x, y

  function onSave (setVal) {
    setVal({ x: x * 25, y: y * 25 })
    hideModal()
  }

  function onSelectBox (newX, newY) {
    x = newX
    y = newY
    boxes[x + y * 5].focus()
  }

  function onKeyDown (e: KeyboardEvent) {
    if (modifierKey(e)) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      y = Math.min(y + 1, 4)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      y = Math.max(y - 1, 0)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      x = Math.min(x + 1, 4)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      x = Math.max(0, x - 1)
    }
    boxes[y + x * 5].focus()
  }


  const positionText: Record<number, Record<number, string>> = {
    0: {
      0: 'Top Left Corner',
      1: 'Upper Left',
      2: 'Middle Left',
      3: 'Lower Left',
      4: 'Bottom Left Corner'
    },
    1: {
      0: 'Top Left of Center',
      1: 'Upper Left of Center',
      2: 'Middle Left of Center',
      3: 'Below Left of Center',
      4: 'Bottom, Left of Center'
    },
    2: {
      0: 'Top Center',
      1: 'Upper Center',
      2: 'Dead Center',
      3: 'Below Center',
      4: 'Bottom Center'
    },
    3: {
      0: 'Top, Right of Center',
      1: 'Upper Right of Center',
      2: 'Middle Right of Center',
      3: 'Below Right of Center',
      4: 'Bottom, Right of Center'
    },
    4: {
      0: 'Top Right Corner',
      1: 'Upper Right',
      2: 'Middle Right',
      3: 'Lower Right',
      4: 'Bottom Right Corner'
    }
  }

  let dialogWasOpened = false
  function onDialogOpen () {
    if (!dialogWasOpened) {
      x = (initialVal.x ?? 50) / 25
      y = (initialVal.y ?? 50) / 25
      dialogWasOpened = true
    }
  }
</script>

<FieldStandard bind:id {label} {path} {required} {defaultValue} conditional={conditional && isNotBlank(imageSrc)} {helptext} {descid} let:value let:setVal let:helptextid>
  {@const _ = init(value)}
  {#if isNotBlank(imageSrc)}
    <Button icon={arrowsIn} on:click={showModal}>Adjust Image Position</Button>
    {#if modalOpen}
      <Dialog size="large" title={label} on:escape={hideModal} continueText="Save" cancelText="Cancel" on:continue={() => onSave(setVal)} {labelid}>
        {@const _dialogopen = onDialogOpen()}
        {#if info}
          <section class="info">
            {info}
          </section>
        {/if}
        <section class="position">
          <p>
            Using the grid overlays, select a focal point in your image to determine how Gato will align, position, and scale your image
            in the section. This will help ensure the focal point of your image is always in frame. By default, Gato will
            use the center of the image.
          </p>
          <div class="image-container">
            <img class="crop-image" src={imageSrc} alt="" />
            <div class="overlay" role="radiogroup" aria-labelledby={labelid}>
              {#each Array.from(Array(5).keys()) as col}
                {#each Array.from(Array(5).keys()) as row}
                  <div
                    bind:this={boxes[col + row * 5]}
                    class="box"
                    class:side={row === 4}
                    class:bottom={col === 4}
                    role="radio"
                    aria-checked={row === x && col === y}
                    tabindex={row === x && col === y ? 0 : -1}
                    on:click={() => onSelectBox(row, col)} on:keydown={onKeyDown}><ScreenReaderOnly>{positionText[row][col]}</ScreenReaderOnly></div>
                {/each}
              {/each}
            </div>
          </div>
        </section>
      </Dialog>
    {/if}
  {/if}
</FieldStandard>

<style>
  section.position {
    border: 1px dashed #767676;
    padding: 1em;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .image-container {
    width: 75%;
    position: relative;
  }
  .crop-image {
    width: 100%;
    display: block;
  }
  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
  }
  .overlay .box {
    background-color: rgba(0, 0, 0, 0.5);
    border-bottom: 1px dashed white;
    border-right: 1px dashed white;
  }
  .overlay .box[aria-checked="true"] {
    background-color: rgba(255, 255, 0, 0.5);
  }
  .overlay .box.side {
    border-right-width: 0;
  }
  .overlay .box.bottom {
    border-bottom-width: 0;
  }
</style>

