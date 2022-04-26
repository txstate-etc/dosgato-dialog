<script lang="ts">
  import type { Feedback, FormStore } from '@txstate-mws/svelte-forms'
  import plusThick from '@iconify-icons/mdi/plus-thick.js'
  import { onMount } from 'svelte'
  import { sleep } from 'txstate-utils'
  import { Form, FieldChooserLink, FieldChoices, FieldDate, FieldDateTime, FieldMultiselect, FieldRadio, FieldSelect, FieldText, FieldMultiple, Tab, Tabs, FieldCheckbox, FieldDualListbox } from '$lib/index'
  import { demoChooserAPI } from '../demo/DemoChooserAPI'
  let store: FormStore

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
      path: 'multi.0.name'
    }]
  }

  const tabs = [
    { title: 'Add More', icon: plusThick },
    { title: 'Dates' },
    { title: 'Selections' },
    { title: 'Checkboxes' }
  ]

  onMount(() => {
    store.setField('asset', 'asset-1')
    store.setField('richtext', 'hello')
  })
</script>

<svelte:head><title>DosGato Dialog Example</title></svelte:head>
<h1>DosGato Dialog Example</h1>

<main>
<Form bind:store {submit} {validate} chooserClient={demoChooserAPI} let:saved>
  <Tabs {tabs}>
    <Tab title="Add More">
      <FieldText path="test" label="Test" required />
      <FieldMultiple path="multi" label="People" initialState={{ first: 'Barney', last: 'Fife' }} let:index>
        <FieldText path="first" label="First Name" />
        <FieldText path="last" label="Last Name" />
      </FieldMultiple>
      <FieldMultiple removable reorder path="multi_scalar" label="Just Names" initialState={'Barney'} let:index>
        <FieldText path="" label={'Name ' + index} />
      </FieldMultiple>
    </Tab>
    <Tab title="Dates">
      <FieldDate path="date" label="Just a Date" min={new Date()} />
      <FieldDateTime path="datetime" label="Date & Time" min={new Date()} />
    </Tab>
    <Tab title="Selections">
      <FieldSelect path="select" label="Choose Color" choices={[{ value: 'red' }, { value: 'blue' }, { value: 'green', disabled: true }]} />
      <FieldRadio notNull horizontal path="radio" label="Choose One House" choices={[{ value: 'hufflepuff' }, { value: 'gryffindor' }, { value: 'ravenclaw' }, { value: 'slytherin' }]} />
      <FieldMultiselect path="multiselect" label="Choose States" defaultValue={['TX']} getOptions={async (search) => { await sleep(500); return search.length ? [{ value: 'AZ', label: 'Arizona' }, { value: 'CO', label: 'Colorado' }, { value: 'TX', label: 'Texas' }] : [] }} />
      <FieldChooserLink path="asset" label="Choose an Asset" images initialType='asset' initialSource="DosGato" initialPath="/chemistry/organic"></FieldChooserLink>
      <FieldDualListbox
        path="role"
        label="Roles"
        multiselect={true}
        choices={[{ value: 'Option 1' }, { value: 'Option 2' }, { value: 'Option 3' }, { value: 'Option 4' }, { value: 'Option 5' },
      { value: 'Option 6' }, { value: 'Option 7' }, { value: 'Option 8' }, { value: 'Option 9' }, { value: 'Option 10' }, { value: 'Option 11' },
      { value: 'Option 12' }, { value: 'Option 13' }, { value: 'Option 14' }, { value: 'Option 15' }, { value: 'Option 16' }]}
        defaultValue={['Option 5']}/>
    </Tab>
    <Tab title="Checkboxes">
      <FieldChoices label="Choose a Fruit" path="choices" choices={[{ value: 'apple' }, { value: 'banana banana banana banana' }, { value: 'orange' }]} />
      <FieldCheckbox path="receiveNewsletter" label="Newsletter" boxLabel="I would like to receive your thrice daily newsletter" defaultValue={true} />
    </Tab>
  </Tabs>
  <button>Save</button>
  {#if saved}Save successful!{/if}
</Form>
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
