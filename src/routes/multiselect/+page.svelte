<script lang="ts">
  import type { FormStore } from '@txstate-mws/svelte-forms'
  import { Form, FieldMultiselect, FieldAutocomplete, FieldSelect } from '$lib/index'
  import type { PopupMenuItem } from '@txstate-mws/svelte-components'
  let store: FormStore

  async function submit (data) {
    return {
      success: true,
      data,
      messages: []
    }
  }

  const planets: PopupMenuItem[] = [
    { label: 'Mercury', value: '1' },
    { label: 'Venus', value: '2' },
    { label: 'Earth', value: '3' },
    { label: 'Mars', value: '4' },
    { label: 'Jupiter', value: '5' },
    { label: 'Saturn', value: '6' },
    { label: 'Uranus', value: '7' },
    { label: 'Neptune', value: '8' },
    { label: 'Pluto', value: '9' }
  ]

  async function getOptions (term: string) {
    return planets.filter(p => p.label?.includes(term))
  }

  async function lookupByValue (val: string) {
    return planets.find(p => p.value === val)
  }
</script>



<svelte:head><title>Multiselect Lookup By Value</title></svelte:head>
<h1>Testing Multiselect Lookup By Value</h1>

<main style="padding: 20px">
  <Form bind:store {submit} preload={{ planets: ['3', '7', '9', '10'], autocomplete: '9', select: '7' }}>
    <FieldMultiselect path='planets' label='Pick Some Planets' getOptions={getOptions} {lookupByValue}/>
    <FieldAutocomplete path='autocomplete' label='Pick One Planet' choices={planets}/>
    <FieldAutocomplete path='defaultval' defaultValue='1' label='Pick One More Planet' choices={planets}/>
    <FieldAutocomplete path='noval' label='And One More' choices={planets}/>
    <FieldSelect path='select' label="Normal Select" choices={planets}/>
  </Form>
</main>

<!-- preload={{ planets: ['3'] }} -->
