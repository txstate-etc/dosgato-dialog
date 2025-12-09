<script lang="ts">
  import { type Feedback, type FormStore } from '@txstate-mws/svelte-forms'
  import apertureLight from '@iconify-icons/ph/aperture-light'
  import { FieldChooserLink, FormDialog } from '$lib'
  import { demoChooserAPI } from '../../demo/DemoChooserAPI'
  import { demoTagClient } from '../../demo/DemoTagAPI'
  let store: FormStore
  let showdialog = true
  async function submit (data: any) {
    return {
      success: true,
      data,
      messages: []
    }
  }

  async function validate (data: any): Promise<Feedback[]> {
    const feedback: Feedback[] = []
    
    return feedback
  }

  const preload = {
    imageAsset: 'asset-4',
    imageAssetNoAlt: 'asset-4',
    imageAssetNoAltNoMeta: 'asset-5',
    documentAsset: 'asset-2',
    folder: 'folder-1',
    gatoPage: 'page-3',
    gatoPageAllowURL: 'page-2',
    externalUrl: 'https://www.google.com',
    broken: '/broken'
  }

</script>

<svelte:head><title>Testing FieldChooserLink</title></svelte:head>
<h1>Testing all Varieties of FieldChooserLink</h1>
<p>
  This page demonstrates possible states of FieldChooserLink. 
</p>

<main>
  {#if showdialog}
  <FormDialog bind:store title="All the Choosers" {submit} {validate} icon={apertureLight} chooserClient={demoChooserAPI} tagClient={demoTagClient} size="large" on:escape={() => { showdialog = false }} {preload} let:saved let:data >
    <FieldChooserLink label="Image Asset" path="imageAsset" assets altTextPath="imagealt" altTextRequired>
      <svelte:fragment slot="metadata" let:selectedAsset>
          {#if selectedAsset?.type === 'asset'}
            Custom metadata content for {selectedAsset.name ?? 'the asset'}
          {/if}
      </svelte:fragment>
    </FieldChooserLink>
    <FieldChooserLink label="Image Asset with no Alt Text field" path="imageAssetNoAlt" assets>
      <svelte:fragment slot="metadata" let:selectedAsset>
          {#if selectedAsset?.type === 'asset'}
            Custom metadata content for {selectedAsset.name ?? 'the asset'}
          {/if}
      </svelte:fragment>
    </FieldChooserLink>
    <FieldChooserLink label="Image Asset with no Alt Text field or metadata" path="imageAssetNoAltNoMeta" assets />
    <FieldChooserLink label="Document Asset" path="documentAsset" assets helptext="not displaying metadata for this one"/>
    <FieldChooserLink label="Folder Selected" path="folder" folders assets />
    <FieldChooserLink label="Gato Page" path="gatoPage" pages />
    <FieldChooserLink label="Gato Page Allow URL Entry" path="gatoPageAllowURL" pages urlEntry/>
    <FieldChooserLink label="External URL" path="externalUrl" urlEntry />
    <FieldChooserLink label="Broken" path="broken" assets pages />
  </FormDialog>
  {/if}
  <button on:click={() => { showdialog = true }}>Show Dialog</button>
</main>
<aside>
  <pre>{JSON.stringify($store?.data, null, 2)}</pre>
</aside>

<style>
  main {
    padding-right: max(30%,10em);
  }
  aside {
    position: absolute;
    top: 3.7em;
    right: 0;
    width: 30%;
    min-width: 10em;
    overflow-x: scroll;
  }
  aside pre {
    font-size: 0.75em;
  }
</style>
