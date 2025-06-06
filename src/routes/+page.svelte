<script lang="ts">
  import type { Feedback, FormStore } from '@txstate-mws/svelte-forms'
  import apertureLight from '@iconify-icons/ph/aperture-light'
  import plusThick from '@iconify-icons/mdi/plus-thick.js'
  import { onMount } from 'svelte'
  import { sleep } from 'txstate-utils'
  import { FieldChooserLink, FieldChoices, FieldDate, FieldDateTime, FieldMultiselect, FieldRadio, FieldSelect, FieldText, FieldMultiple, Tab, Tabs, FieldCheckbox, FieldDualListbox, FieldAutocomplete, FieldIconPicker, FieldColorPicker, FieldTextArea, FieldCodeEditor, FormDialog, FieldCropper, type CropOutput, type RawURL, type AnyItem, FieldImagePosition, FieldTagPicker } from '$lib'
  import { demoChooserAPI } from '../demo/DemoChooserAPI'
  import type { PopupMenuItem } from '@txstate-mws/svelte-components'
    import { demoTagClient } from '../demo/DemoTagAPI';
  let store: FormStore
  let showdialog = true
  async function submit (data: { crop: CropOutput }) {
    return {
      success: true,
      data,
      messages: []
    }
  }

  async function validate (data: { crop: CropOutput }): Promise<Feedback[]> {
    return [{
      type: 'error',
      message: 'Nope',
      path: 'multi.0.first'
    },
    {
      type: 'warning',
      message: 'Be careful'
    },
    {
      type: 'success',
      message: 'Yay!'
    }]
  }

  const tabs = [
    { name: 'Add More', icon: plusThick },
    { name: 'Text' },
    { name: 'Dates' },
    { name: 'Selections', required: true },
    { name: 'Checkboxes' },
    { name: 'Images' }
  ]

  let colors: PopupMenuItem[] = []
  let houses = [{ value: 'hufflepuff' }, { value: 'gryffindor' }, { value: 'ravenclaw' }, { value: 'slytherin' }]
  let colorpicker = [{ color: '#FF69B4', name: 'Hot Pink', value: 'hotpink' }, { color: '#008080', name: 'Teal', value: 'teal' }, { color: '#FEE440', name: 'Yellow', value: 'yellow' }, { color: '#6495ED', name: 'Cornflower', value: 'cornflower' }]

  onMount(async () => {
    void store.setField('asset', 'asset-1')
    void store.setField('asset', 'https://google.com')
    const { CropImage } = await import('./crop')
    if (!window.customElements.get('crop-img')) window.customElements.define('crop-img', CropImage)
    colors = [{ value: 'red' }, { value: 'blue' }, { value: 'green', disabled: true }]
  })

  let selectedAsset: AnyItem | RawURL

</script>

<svelte:head><title>DosGato Dialog Example</title></svelte:head>
<h1>DosGato Dialog Example</h1>

<main>
{#if showdialog}
<FormDialog bind:store title="Example Dialog" {submit} {validate} icon={apertureLight} chooserClient={demoChooserAPI} tagClient={demoTagClient} size="large" on:escape={() => { showdialog = false }} let:saved let:data preload={{ radio: 'ravenclaw' }}>
  <Tabs {tabs}>
    <Tab name="Add More">
      <FieldText path="test" label="Test" required helptext="This is some very long test helptext. It is really long to help show us what happens when long help text is going to wrap all the way to another line and allow us to test the expand and collapse functionality by clicking on it. <i>It also tests for allowance of html tags.</i>"/>
      <FieldMultiple path="multi" label="People" initialState={{ first: 'Barney', last: 'Fife' }} helptext="test" let:index>
        <FieldText path="first" label="First Name" helptext="This is some test helptext. It's a little long so we can test wrapping at different screen sizes." />
        <FieldText path="last" label="Last Name" />
      </FieldMultiple>
      <FieldMultiple removable reorder path="multi_scalar" label="Just Names" initialState={'Barney'} let:index>
        <FieldText path="" label={'Name ' + index} />
      </FieldMultiple>
      <FieldMultiple reorder path="images" label="Images" let:index>
        <FieldChooserLink path="" assets urlEntry />
      </FieldMultiple>
      <FieldMultiple label="Things" removable reorder path="multi_initial_state_function" initialState={(index) => { return { thing: `This will be thing ${index + 1}` } }} confirmDelete="Are you sure?">
        <FieldText path="thing" />
      </FieldMultiple>
    </Tab>
    <Tab name="Text">
      <FieldText path="charlimit" label="Character Limit" maxlength={10} />
      <FieldTextArea path="textarea" label="Textarea" rows={10} />
      <FieldCodeEditor path="code" label="CSS" language="css" rows={8} />
    </Tab>
    <Tab name="Dates">
      <FieldDate path="date" label="Just a Date" min={new Date()} />
      <FieldDateTime path="datetime" label="Date & Time" min={new Date()} related />
    </Tab>
    <Tab name="Selections">
      <FieldSelect path="select" label="Choose Color" choices={colors} notNull/>
      <button type="button" on:click={() => { colors = colors.filter(c => c.value !== 'blue') }}>Remove Blue</button>
      <button type="button" on:click={() => { houses = houses.filter(c => c.value !== 'ravenclaw') }}>Remove Ravenclaw</button>
      <button type="button" on:click={() => { colorpicker = colorpicker.filter(c => c.value !== 'teal') }}>Remove Teal</button>
      <FieldRadio notNull horizontal path="radio" label="Choose One House" choices={houses} />
      <FieldCheckbox path="evil" boxLabel="I am not an evil Slytherin" defaultValue={true} conditional={data.radio === 'slytherin'}/>
      <FieldText path="harrypottername" label="Enter a Name" defaultValue="My Harry Potter Name" conditional={data.radio === 'slytherin'}/>
      <FieldChooserLink path="asset" label="Choose an Asset" pages assets urlEntry initialSource="Assets" initialPath="/chemistry/organic"></FieldChooserLink>
      <FieldIconPicker path="icon" label="Icon" defaultValue={{ icon: 'fa-spider', prefix: 'fas' }}/>
      <FieldColorPicker addAllOption notNull defaultValue="hotpink" path="color" label="Another Color" options={colorpicker} helptext="Just pick something."/>
      <FieldDualListbox
        path="role"
        label="Roles"
        multiselect={true}
        choices={[{ value: 'Option 1' }, { value: 'Option 2' }, { value: 'Option 3' }, { value: 'Option 4' }, { value: 'Option 5' },
          { value: 'Option 6' }, { value: 'Option 7' }, { value: 'Option 8' }, { value: 'Option 9' }, { value: 'Option 10' }, { value: 'Option 11' },
          { value: 'Option 12' }, { value: 'Option 13' }, { value: 'Option 14' }, { value: 'Option 15' }, { value: 'Option 16' }]}
        defaultValue={['Option 5']}/>
      <FieldAutocomplete label="State" path='homestate' defaultValue='TX' helptext='Please select the state closest to your destination.' choices={[{ label: 'Texas', value: 'TX' }, { label: 'Illinois', value: 'IL' }, { label: 'Tennessee', value: 'TN' }, { label: 'Indiana', value: 'IN' }, { label: 'Pennsylvania', value: 'PA' }, { label: 'North Carolina', value: 'NC' }, { label: 'Iowa', value: 'IA' }]}/>
      <FieldMultiselect path="multiselect" label="Choose States" defaultValue={['TX']} getOptions={async (search) => { await sleep(500); return search.length ? [{ value: 'AZ', label: 'Arizona' }, { value: 'CO', label: 'Colorado' }, { value: 'TX', label: 'Texas' }] : [] }} />
    </Tab>
    <Tab name="Checkboxes">
      <FieldChoices label="Choose a Fruit" path="choices" choices={[{ value: 'apple' }, { value: 'banana banana banana banana' }, { value: 'orange' }]} />
      <FieldChoices label="Choose a Vegetable" path="vegchoices" selectAll choices={[{ value: 'lettuce' }, { value: 'carrot' }, { value: 'cucumber' }, { value: 'celery' }]} />
      <FieldCheckbox path="receiveNewsletter" label="Newsletter" boxLabel="I would like to receive your thrice daily newsletter" defaultValue={true} />
      <FieldTagPicker path="tags" label="Tags" target={undefined} showTitleInDialog />
    </Tab>
    <Tab name="Images">
      <FieldChooserLink path="cropimage" bind:selectedAsset label="Image to Crop" pages images initialSource="Assets"initialPath="/physics" ></FieldChooserLink>
      <FieldSelect path="ar" number label="Select Aspect Ratio" choices={[{ value: 1, label: '1:1' }, { value: 1.333, label: '4:3' }, { value: 0.75, label: '3:4' }, { value: 1.7778, label: '16:9' }]} defaultValue={1} notNull />
      <FieldCropper path="crop" label="Image Crop" selectionAspectRatio={data.ar} imageSrc="{selectedAsset?.url}"/>
      {#if selectedAsset && 'image' in selectedAsset && selectedAsset.image}
        <crop-img alt="" src={selectedAsset.url} imageaspect={selectedAsset.image.width / selectedAsset.image.height} cropleft={data.crop?.left ?? 0} cropright={data.crop?.right ?? 0} croptop={data.crop?.top ?? 0} cropbottom={data.crop?.bottom ?? 0} />
      {/if}
      <FieldImagePosition path="position" label="Image Position" imageSrc="{selectedAsset?.url}" helptext="Select the most important part of your image."/>
      {#if selectedAsset && 'image' in selectedAsset && selectedAsset.image}
        <img alt="" src={selectedAsset.url} style="width: 100%; max-height: 300px; object-fit: cover; object-position: {data.position?.x ?? 50}% {data.position?.y ?? 50}%"/>
      {/if}
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
  crop-img {
    padding-top: 56.25%;
  }
</style>
