<script lang="ts">
  import { Form, FieldText, FieldChoices, FieldSelect, FieldNumber, FieldDate, FieldCheckbox, FieldChooserLink, FieldDateTime, FieldTextArea, FieldRadio, FieldAutocomplete, FieldColorPicker, FieldIconPicker } from '$lib'
  import type { Feedback } from '@txstate-mws/svelte-forms'
  import { demoChooserAPI } from '../../demo/DemoChooserAPI'

  let store

  async function submit (data) {
    return {
      success: true,
      data,
      messages: []
    }
  }

  async function validate (data): Promise<Feedback[]> {
    return []
  }
</script>

<svelte:head><title>Testing Help Text</title></svelte:head>
<h1>Testing Help Text</h1>
<main>
  <Form bind:store {submit} {validate} chooserClient={demoChooserAPI}>
    <FieldText path="name" label="Text" helptext="Last, First Middle Initial"/>
    <FieldCheckbox path="pineapple" label="Pineapple" boxLabel="I like pineapple on pizza." helptext="There is no right answer"/>
    <FieldChoices label="Choose a Pie" path="choices" choices={[{ value: 'apple' }, { value: 'pecan' }, { value: 'pumpkin' }]} helptext="Pie options are seasonal."/>
    <FieldChooserLink path="asset" label="Choose an Asset" images initialType='asset' initialSource="DosGato" helptext="Any image is fine, just pick one."/>
    <FieldDate path="date" label="Choose a delivery day" helptext="Mondays are best" />
    <FieldDateTime path="datetime" label="Preferred appointment time" helptext="Please don't choose a time in the middle of the night" />
    <FieldNumber path="number" label="Lucky Number" helptext="Enter a whole number"/>
    <FieldTextArea path="memoir" label="Memoir" rows={4} helptext="Tell us about yourself"/>
    <FieldRadio path="radios" label="Cheese Preference" choices={[{ value: 'Yes' }, { value: 'No' }]} helptext="Do you like cheese?"/>
    <FieldSelect path="select" label="Day of Week" choices={[{ value: 'Monday' }, { value: 'Tuesday' }, { value: 'Wednesday' }, { value: 'Thursday' }, { value: 'Friday' }, { value: 'Saturday' }, { value: 'Sunday' }]} helptext="What day is it today?"/>
    <FieldAutocomplete path="planet" label="Planet" choices={[{ value: 'Mercury' }, { value: 'Venus' }, { value: 'Earth' }, { value: 'Mars' }, { value: 'Jupiter' }, { value: 'Saturn' }, { value: 'Uranus' }, { value: 'Neptune' }, { value: 'Pluto' }]} helptext="Pluto will always be a planet to me"/>
    <FieldColorPicker path="color" label="Lettering Color" options={[{ color: '#FF69B4', name: 'Hot Pink', value: 'hotpink' }, { color: '#008080', name: 'Teal', value: 'teal' }, { color: '#FEE440', name: 'Yellow', value: 'yellow' }]} helptext="What color writing would you like on your cake?"/>
    <FieldIconPicker path="icon" label="Best Icon" helptext="Choose an icon that represents your current mood"/>
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