<script lang="ts">
  import type { ChooserStore } from './ChooserStore'
  import Thumbnail from './Thumbnail.svelte'
  import Details from './Details.svelte'
  import { createEventDispatcher } from 'svelte'

  export let previewId: string
  export let store: ChooserStore
  const { preview } = store
  export let thumbnailExpanded: boolean
  const dispatch = createEventDispatcher()

  function reactToPreview (_preview) {
    if (thumbnailExpanded) dispatch('thumbnailsizechange')
  }
  $: reactToPreview($preview)
</script>

<section id={previewId} class="dialog-chooser-preview" class:image={$preview?.type === 'asset' && $preview.image} class:collapsed={!thumbnailExpanded} tabindex="-1">
  {#if $preview}
    {#if $preview?.type === 'asset' && $preview.image}
      <div class="mobile-name">
        <div class="label">Name:</div>
        <div>{$preview.name}</div>
      </div>
    {/if}
    <div class="preview-container">
      <Thumbnail item={$preview} larger expandable expanded={thumbnailExpanded} on:thumbnailsizechange />
      {#if !thumbnailExpanded}<Details item={$preview} />{/if}
    </div>
  {:else}
    <section class="placeholder">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 371 181">
        <g id="Group_2845" data-name="Group 2845" transform="translate(-34 -94)">
          <rect id="Rectangle_2035" data-name="Rectangle 2035" width="371" height="181" transform="translate(34 94)" fill="#d8d8d8"/>
          <path id="Icon_awesome-image" data-name="Icon awesome-image" d="M145.453,124.875H15.047A15.047,15.047,0,0,1,0,109.828V19.547A15.047,15.047,0,0,1,15.047,4.5H145.453A15.047,15.047,0,0,1,160.5,19.547v90.281A15.047,15.047,0,0,1,145.453,124.875ZM35.109,22.055A17.555,17.555,0,1,0,52.664,39.609,17.555,17.555,0,0,0,35.109,22.055ZM20.063,104.813H140.438V69.7L113,42.269a3.762,3.762,0,0,0-5.32,0L65.2,84.75l-17.4-17.4a3.762,3.762,0,0,0-5.32,0L20.063,89.766Z" transform="translate(139 119.5)" fill="#c7c7c7"/>
        </g>
      </svg>
      <p>Select an item to preview it here.</p>
    </section>
  {/if}
</section>

<style>
  .dialog-chooser-preview {
    width: 25%;
    max-width: 21em;
    height: calc(100% - 4em);
    padding: 0 1em 1em 1em;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .dialog-chooser-preview :global(.dialog-chooser-thumbnail button) {
      display: none;
  }
  .preview-container {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  .placeholder {
    position: relative;
  }
  .placeholder svg {
    width: 100%;
  }
  .placeholder p {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    font-weight: 600;
    width: 90%;
    margin: 0;
    display: flex;
    justify-content: center;
    text-align: center;
  }
  .mobile-name {
    display: none;
  }
  .mobile-name .label {
    font-weight: bold;
  }
  @container dosgato-dialog-chooser-window (max-width: 800px) {
    .dialog-chooser-preview {
      order: 1;
      width: 100%;
      max-width: unset;
      padding: 0;
      height: unset;
      display: flex;
      overflow: hidden;
    }
    .dialog-chooser-preview.image.collapsed {
      flex-direction: column;
      gap: 0.75em;
    }
    .preview-container {
      flex-direction: row;
      height: 25vh;
    }
    .dialog-chooser-preview .preview-container :global(.dialog-chooser-thumbnail) {
      max-width: 50%;
    }
    .dialog-chooser-preview .preview-container :global(.dialog-chooser-thumbnail.expanded) {
      max-width: unset;
    }
    .dialog-chooser-preview .preview-container :global(.dialog-chooser-thumbnail img) {
      object-fit: cover;
      object-position: center;
    }
    .dialog-chooser-preview .preview-container :global(.dialog-chooser-thumbnail.expanded img) {
      object-fit: scale-down;
      width: unset;
    }
    .dialog-chooser-preview:not(.image) .dialog-chooser-thumbnail :global(svg) {
      height: 8em;
      width: 8em;
    }
    .dialog-chooser-preview .placeholder {
      width: 100%;
      display: flex;
      justify-content: center;
    }
    .dialog-chooser-preview :global(.dialog-chooser-thumbnail button) {
      display: block;
    }
    .dialog-chooser-preview:not(.image) :global(.preview-container) {
      height: unset;
    }
    .dialog-chooser-preview.collapsed .mobile-name {
      display: block;
      font-size: 0.75em;
    }
    .dialog-chooser-preview :global(.dialog-chooser-info) {
      width: 50%;
      flex-direction: column;
      flex-wrap: nowrap;
      overflow-y: scroll;
      font-size: 0.75em;
    }
    .dialog-chooser-preview.image :global(.dialog-chooser-info .name){
      display: none;
    }
  }
</style>
