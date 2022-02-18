<script lang="ts">
  import type { Feedback } from '@txstate-mws/svelte-forms'
  import { Form, FieldChoices, FieldDate, FieldDateTime, FieldSelect, FieldText, FieldMultiple, Tab, Tabs } from '$lib'
import FieldRadio from '$lib/FieldRadio.svelte'
  let store

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
</script>

<svelte:head><title>DosGato Dialog Example</title></svelte:head>
<h1>DosGato Dialog Example</h1>

<main>
<Form bind:store {submit} {validate} let:saved>
  <Tabs>
    <Tab title="Add More">
      <FieldText path="test" label="Test" />
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
    </Tab>
    <Tab title="Checkboxes">
      <FieldChoices label="Choose a Fruit" path="choices" choices={[{ value: 'apple' }, { value: 'banana banana banana banana' }, { value: 'orange' }]} />
    </Tab>
  </Tabs>
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
