<script lang="ts">
  import arrowsIn from '@iconify-icons/ph/arrows-in'
  import { modifierKey, ScreenReaderOnly } from '@txstate-mws/svelte-components'
  import { FORM_CONTEXT, FORM_INHERITED_PATH, type FormStore } from '@txstate-mws/svelte-forms'
  import { getContext } from 'svelte'
  import { isNotBlank, randomid } from 'txstate-utils'
  import FieldStandard from '../FieldStandard.svelte'
  import Button from '../Button.svelte'
  import { Dialog, type ImagePositionOutput } from '$lib'

  export let id: string | undefined = undefined
  export let path: string
  export let imageSrc: string | undefined
  export let label: string = ''
  export let required = false
  export let conditional: boolean | undefined = undefined
  export let helptext: string | undefined = undefined
  export let defaultValue: ImagePositionOutput = { x: 50, y: 50 }

  const inheritedPath = getContext<string>(FORM_INHERITED_PATH)
  const finalPath = [inheritedPath, path].filter(isNotBlank).join('.')
  const store = getContext<FormStore>(FORM_CONTEXT)
  const val = store.getField<ImagePositionOutput>(finalPath)

  const boxes: HTMLDivElement[] = []

  const descid = randomid()
  const labelid = randomid()

  let modalOpen: boolean = false
  function showModal () {
    if (!modalOpen) {
      x = ($val?.x ?? 50) / 25
      y = ($val?.y ?? 50) / 25
    }
    modalOpen = true
  }

  function hideModal () {
    modalOpen = false
  }

  let x: number, y: number

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

  function resetPosition () {
    x = 2
    y = 2
  }
</script>

<FieldStandard bind:id {label} {path} {required} {defaultValue} conditional={conditional && isNotBlank(imageSrc)} {helptext} {descid} let:setVal let:helptextid>
  {#if isNotBlank(imageSrc)}
    <Button icon={arrowsIn} on:click={showModal}>Adjust Image Position</Button>
    {#if modalOpen}
      <Dialog size="large" title={label} on:escape={hideModal} continueText="Save" cancelText="Cancel" on:continue={() => onSave(setVal)} {labelid}>
        <section class="info">
          <p>This image is in a responsive layout, meaning the size and shape of the image may change based on the viewer’s browser window and device.</p>
          <div class="warning">
            <div class="icon">
              <svg width="100%" height="100%" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M21.7931 17.9114C22.0668 18.4197 22.0668 19.0061 21.7931 19.4752C21.5195 19.9834 21.0112 20.2571 20.4639 20.2571H3.57518C2.98876 20.2571 2.48054 19.9834 2.20688 19.4752C1.93322 19.0061 1.93322 18.4197 2.20688 17.9114L10.6512 3.52473C10.9249 3.05559 11.4331 2.74284 12.0195 2.74284C12.5669 2.74284 13.0751 3.05559 13.3488 3.52473L21.7931 17.9114ZM15.0762 2.51348L15.0777 2.51616L23.538 16.93L23.5555 16.9625C24.1294 18.0283 24.1722 19.3444 23.5393 20.454C22.8879 21.637 21.6838 22.2587 20.4639 22.2587H3.57518C2.34516 22.2587 1.12477 21.6603 0.460681 20.4539C-0.172198 19.3444 -0.129382 18.0282 0.444499 16.9625L0.461978 16.93L8.92228 2.51616L8.92396 2.51329C9.54626 1.44877 10.7019 0.741211 12.0195 0.741211C13.326 0.741211 14.4684 1.47375 15.0762 2.51348ZM12.9067 13.3785C12.9398 13.2815 12.9578 13.1759 12.9578 13.0637V8.68517C12.9578 8.17695 12.5278 7.74691 12.0195 7.74691C11.4722 7.74691 11.0813 8.17695 11.0813 8.68517V13.0637C11.0813 13.1745 11.0973 13.2788 11.1274 13.3748C11.2459 13.7532 11.583 14.002 12.0195 14.002C12.4236 14.002 12.7783 13.7548 12.9067 13.3785ZM10.9757 15.8208C10.8443 16.0203 10.7685 16.2567 10.7685 16.504C10.7685 17.2077 11.3158 17.7551 12.0195 17.7551C12.6842 17.7551 13.2706 17.2077 13.2706 16.504C13.2706 16.2554 13.1885 16.0178 13.051 15.8177C12.8209 15.4828 12.4355 15.253 12.0195 15.253C11.5777 15.253 11.1975 15.4842 10.9757 15.8208Z" fill="black"/>
              </svg>
            </div>
            <p>If there is sensitive content in the image that should never be visible to the audience, crop or edit the file in an editing software before uploading. </p>
          </div>
          <p>Using the grid overlays, select a focal point in your image to determine how Gato will align, position, and scale your image in the section. This will help ensure the focal point of your image is always in frame. By default, Gato will use the center of the image.</p>
        </section>
        <section class="position">
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
                    aria-describedby={helptextid}
                    tabindex={row === x && col === y ? 0 : -1}
                    on:click={() => onSelectBox(row, col)} on:keydown={onKeyDown}><ScreenReaderOnly>{positionText[row][col]}</ScreenReaderOnly></div>
                {/each}
              {/each}
            </div>
          </div>
          <div class="button-container">
            <Button type="button" class="reset-position" on:click={resetPosition}>Reset Position</Button>
          </div>
        </section>
      </Dialog>
    {/if}
  {/if}
</FieldStandard>

<style>
  .warning {
    display: flex;
    gap: 1.5em;
    background-color: #F3D690;
    padding: 0.5em;
    border-radius: 6px;
  }
  .warning .icon {
    font-size: 3em;
    width: 1em;
  }
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
    margin-bottom: 1em;
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
  .button-container {
    width: 100%;
  }
  :global(button.reset-position.reset-position) {
    background-color: var(--dg-button-cancel-bg, #808080);
    color: var(--dg-button-cancel-text, #fff);
  }
  :global(button.reset-position.reset-position):not([disabled]):hover {
    background-color: var(--dg-button-cancel-hover-bg, #595959);
  }
</style>
