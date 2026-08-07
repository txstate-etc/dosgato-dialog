<script lang="ts">
  import type { Feedback, FormStore } from '@txstate-mws/svelte-forms'
  import databaseIcon from '@iconify-icons/ph/database'
  import { FieldDataChooser, FormDialog } from '$lib'
  import { demoDataChooserAPI } from '../../demo/DemoDataChooserAPI'
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
    return []
  }

  const preload = {
    preloadedArticle: 'data-1',
    brokenArticle: 'data-deleted'
  }
</script>

<svelte:head><title>Testing FieldDataChooser</title></svelte:head>
<h1>Testing all Varieties of FieldDataChooser</h1>
<p>
  This page demonstrates possible states of FieldDataChooser.
</p>

<main>
  {#if showdialog}
  <FormDialog bind:store title="All the Data Choosers" {submit} {validate} icon={databaseIcon} dataChooserClient={demoDataChooserAPI} size="large" on:escape={() => { showdialog = false }} {preload}>
    <FieldDataChooser label="Article (empty, two sources)" path="article" rootTemplateKey="articledata" />
    <FieldDataChooser label="Article (preloaded)" path="preloadedArticle" rootTemplateKey="articledata" />
    <FieldDataChooser label="Article (preloaded with a deleted item)" path="brokenArticle" rootTemplateKey="articledata" helptext="the preloaded id no longer resolves; the value is preserved until replaced or removed" />
    <FieldDataChooser label="Color (single source, required)" path="color" rootTemplateKey="colordata" required />
    <FieldDataChooser label="Article (published only)" path="publishedArticle" rootTemplateKey="articledata" publishedOnly helptext="unpublished items are hidden via the publishedOnly prop; modified items still have a live published version so they remain choosable" />
    <FieldDataChooser label="Articles only (by templateKey)" path="articleOnly" rootTemplateKey="articledata" filter={item => item.templateKey == null || item.templateKey === 'articledata'} helptext="the filter prop restricts choices to a specific type of data; containers pass through" />
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
