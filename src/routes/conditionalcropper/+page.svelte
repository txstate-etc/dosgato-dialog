<script lang="ts">
  import { FieldCheckbox, FieldChooserLink, FieldCropper, FormDialog, type Asset, type CropOutput } from '$lib'
  import type { FormStore } from '@txstate-mws/svelte-forms'
  import { demoChooserAPI } from '../../demo/DemoChooserAPI'
  let showdialog = true
  let selectedAsset: Asset
  let store: FormStore

  const preload = {
    addsecondcrop: true,
    image: 'asset-4',
    squarecrop: {
      left: 0.21527777777777782,
      right: 0.19177350427350429,
      top: 0.04049079979330427,
      bottom: 0.07127239488652737
    },
    widecrop: {
      left: 0.15544871794871795,
      right: 0.09134615384615384,
      top: 0.36537741507257304,
      bottom: 0.25852231600807635
    }
  }
</script>

<svelte:head><title>Conditional Cropper</title></svelte:head>
<h1>Conditional Cropper Preload Issue</h1>

<main>
  {#if showdialog}
  <FormDialog bind:store title="Text Conditional Cropper Preload" chooserClient={demoChooserAPI} size="large" on:escape={() => { showdialog = false }} let:data {preload} >
    <FieldCheckbox path="addsecondcrop" boxLabel="Add a second crop" />
    <FieldChooserLink path="image" label="Choose an image" bind:selectedAsset={selectedAsset} images/>
    <FieldCropper path="squarecrop" label="Square Crop Image" imageSrc="{selectedAsset?.url}" selectionAspectRatio={1} helptext="Not conditional on anything"/>
    <FieldCropper path="widecrop" label="Conditional Crop Image" imageSrc="{selectedAsset?.url}" selectionAspectRatio={3} conditional={!!data.addsecondcrop} helptext="This crop is conditional."/>
  </FormDialog>
  {/if}
  <button on:click={() => { showdialog = true }}>Show Dialog</button>
</main>
<aside>
  <pre>{JSON.stringify($store?.data, null, 2)}</pre>
</aside>
