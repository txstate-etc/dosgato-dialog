<script lang="ts">
  import type { Feedback, FormStore } from '@txstate-mws/svelte-forms'
  import apertureLight from '@iconify-icons/ph/aperture-light'
  import plusThick from '@iconify-icons/mdi/plus-thick.js'
  import { onMount } from 'svelte'
  import { sleep } from 'txstate-utils'
  import { FieldChooserLink, FieldChoices, FieldDate, FieldDateTime, FieldMultiselect, FieldRadio, FieldSelect, FieldText, FieldMultiple, Tab, Tabs, FieldCheckbox, FieldDualListbox, FieldAutocomplete, FieldIconPicker, FieldColorPicker, FieldTextArea, FieldCodeEditor, FormDialog, FieldImageCropper } from '$lib'
  import { demoChooserAPI } from '../demo/DemoChooserAPI'
  let store: FormStore
  let showdialog = true
  async function submit (data) {
    return {
      success: true,
      data,
      messages: []
    }
  }

  async function validate (data): Promise<Feedback[]> {
    return [{
      type: 'error',
      message: 'Nope',
      path: 'multi.0.first'
    }]
  }

  const tabs = [
    { name: 'Add More', icon: plusThick },
    { name: 'Text' },
    { name: 'Dates' },
    { name: 'Selections', required: true },
    { name: 'Checkboxes' }
  ]

  onMount(() => {
    store.setField('asset', 'asset-1')
    store.setField('asset', 'https://google.com')
  })

  let selectedAsset: any
</script>

<svelte:head><title>DosGato Dialog Example</title></svelte:head>
<h1>DosGato Dialog Example</h1>

<main>
{#if showdialog}
<FormDialog bind:store title="Example Dialog" {submit} {validate} icon={apertureLight} chooserClient={demoChooserAPI} size="large" on:escape={() => { showdialog = false }} let:saved>
  <Tabs {tabs}>
    <Tab name="Add More">
      <FieldText path="test" label="Test" required />
      <FieldMultiple path="multi" label="People" initialState={{ first: 'Barney', last: 'Fife' }} let:index>
        <FieldText path="first" label="First Name" />
        <FieldText path="last" label="Last Name" />
      </FieldMultiple>
      <FieldMultiple removable reorder path="multi_scalar" label="Just Names" initialState={'Barney'} let:index>
        <FieldText path="" label={'Name ' + index} />
      </FieldMultiple>
    </Tab>
    <Tab name="Text">
      <FieldTextArea path="textarea" label="Textarea" rows={10} />
      <FieldCodeEditor path="code" label="CSS" language="css" rows={8} />
    </Tab>
    <Tab name="Dates">
      <FieldDate path="date" label="Just a Date" min={new Date()} />
      <FieldDateTime path="datetime" label="Date & Time" min={new Date()} />
    </Tab>
    <Tab name="Selections">
      <FieldSelect path="select" label="Choose Color" choices={[{ value: 'red' }, { value: 'blue' }, { value: 'green', disabled: true }]} />
      <FieldRadio notNull horizontal path="radio" label="Choose One House" choices={[{ value: 'hufflepuff' }, { value: 'gryffindor' }, { value: 'ravenclaw' }, { value: 'slytherin' }]} />
      <FieldMultiselect path="multiselect" label="Choose States" defaultValue={['TX']} getOptions={async (search) => { await sleep(500); return search.length ? [{ value: 'AZ', label: 'Arizona' }, { value: 'CO', label: 'Colorado' }, { value: 'TX', label: 'Texas' }] : [] }} />
      <FieldChooserLink path="asset" label="Choose an Asset" pages assets urlEntry initialSource="Assets" initialPath="/chemistry/organic"></FieldChooserLink>
      <FieldChooserLink path="cropimage" bind:selectedAsset label="Image to Crop" pages images initialSource="Assets"initialPath="/physics" ></FieldChooserLink>
      <FieldImageCropper  path="crop" label="Image Crop"  selectionAspectRatio={1.0} imageSrc="{selectedAsset?.url}"/>
      <FieldAutocomplete label="State" path='homestate' defaultValue='TX' helptext='Please select the state closest to your destination.' choices={[{ label: 'Texas', value: 'TX' }, { label: 'Illinois', value: 'IL' }, { label: 'Tennessee', value: 'TN' }, { label: 'Indiana', value: 'IN' }, { label: 'Pennsylvania', value: 'PA' }, { label: 'North Carolina', value: 'NC' }, { label: 'Iowa', value: 'IA' }]}/>
      <FieldIconPicker path="icon" label="Icon" defaultValue={{ icon: 'fa-spider', prefix: 'fas' }}/>
      <FieldColorPicker addAllOption notNull defaultValue="hotpink" path="color" label="Another Color" options={[{ color: '#FF69B4', name: 'Hot Pink', value: 'hotpink' }, { color: '#008080', name: 'Teal', value: 'teal' }, { color: '#FEE440', name: 'Yellow', value: 'yellow' }, { color: '#6495ED', name: 'Cornflower', value: 'cornflower' }]} helptext="Just pick something."/>
      <FieldDualListbox
        path="role"
        label="Roles"
        multiselect={true}
        choices={[{ value: 'Option 1' }, { value: 'Option 2' }, { value: 'Option 3' }, { value: 'Option 4' }, { value: 'Option 5' },
      { value: 'Option 6' }, { value: 'Option 7' }, { value: 'Option 8' }, { value: 'Option 9' }, { value: 'Option 10' }, { value: 'Option 11' },
      { value: 'Option 12' }, { value: 'Option 13' }, { value: 'Option 14' }, { value: 'Option 15' }, { value: 'Option 16' }]}
        defaultValue={['Option 5']}/>
    </Tab>
    <Tab name="Checkboxes">
      <FieldChoices label="Choose a Fruit" path="choices" choices={[{ value: 'apple' }, { value: 'banana banana banana banana' }, { value: 'orange' }]} />
      <FieldCheckbox path="receiveNewsletter" label="Newsletter" boxLabel="I would like to receive your thrice daily newsletter" defaultValue={true} />
    </Tab>
  </Tabs>
  <svelte:fragment slot="submit" let:saved>
    <button>Save</button>
    {#if saved}Save successful!{/if}
  </svelte:fragment>
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
