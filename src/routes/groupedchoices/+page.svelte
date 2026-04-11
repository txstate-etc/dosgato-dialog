<script lang="ts">
  import { Form, FieldChoices } from '$lib'
  import type { Feedback } from '@txstate-mws/svelte-forms'

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

<svelte:head><title>Grouped Choices</title></svelte:head>
<h1>Grouped Choices</h1>
<main>
  <Form bind:store {submit} {validate}>
    <FieldChoices label="Filters" path="filters" selectAll groupSelect choices={[
      { value: 'f1', label: 'Engineering', group: 'Department' },
      { value: 'f2', label: 'Science', group: 'Department' },
      { value: 'f3', label: 'Liberal Arts', group: 'Department' },
      { value: 'f4', label: 'Business', group: 'Department' },
      { value: 'f5', label: 'Undergraduate', group: 'Program' },
      { value: 'f6', label: 'Graduate', group: 'Program' },
      { value: 'f7', label: 'Doctoral', group: 'Program' },
      { value: 'f8', label: 'On Campus', group: 'Modality' },
      { value: 'f9', label: 'Online', group: 'Modality' },
      { value: 'f10', label: 'Hybrid', group: 'Modality' }
    ]} />

    <FieldChoices label="Groups Without Select All" path="noselectall" choices={[
      { value: 'a', label: 'Red', group: 'Warm' },
      { value: 'b', label: 'Orange', group: 'Warm' },
      { value: 'c', label: 'Yellow', group: 'Warm' },
      { value: 'd', label: 'Blue', group: 'Cool' },
      { value: 'e', label: 'Green', group: 'Cool' },
      { value: 'f', label: 'Purple', group: 'Cool' }
    ]} />

    <FieldChoices label="Mixed (Some Ungrouped)" path="mixed" selectAll groupSelect choices={[
      { value: 'misc1', label: 'Featured' },
      { value: 'misc2', label: 'New' },
      { value: 'g1', label: 'Fall 2026', group: 'Semester' },
      { value: 'g2', label: 'Spring 2027', group: 'Semester' },
      { value: 'g3', label: 'Austin', group: 'Campus' },
      { value: 'g4', label: 'Dallas', group: 'Campus' },
      { value: 'g5', label: 'Houston', group: 'Campus' }
    ]} />

    <FieldChoices label="Ungrouped (Existing Behavior)" path="flat" selectAll choices={[
      { value: 'apple' },
      { value: 'banana' },
      { value: 'orange' },
      { value: 'grape' }
    ]} />

    <FieldChoices label="With Disabled Choices" path="disabled" selectAll groupSelect choices={[
      { value: 'd1', label: 'Available', group: 'Tier 1' },
      { value: 'd2', label: 'Unavailable', group: 'Tier 1', disabled: true },
      { value: 'd3', label: 'Available', group: 'Tier 2' },
      { value: 'd4', label: 'Also Available', group: 'Tier 2' }
    ]} />

    <FieldChoices label="Vertical Layout" path="vertical" selectAll groupSelect maxwidth={9999} choices={[
      { value: 'v1', label: 'Calculus', group: 'Math' },
      { value: 'v2', label: 'Statistics', group: 'Math' },
      { value: 'v3', label: 'Linear Algebra', group: 'Math' },
      { value: 'v4', label: 'Biology', group: 'Science' },
      { value: 'v5', label: 'Chemistry', group: 'Science' },
      { value: 'v6', label: 'Physics', group: 'Science' },
      { value: 'v7', label: 'English', group: 'Humanities' },
      { value: 'v8', label: 'History', group: 'Humanities' }
    ]} />

    <FieldChoices label="Group Select Only (No Global)" path="grouponly" groupSelect choices={[
      { value: 'go1', label: 'Soccer', group: 'Fall' },
      { value: 'go2', label: 'Football', group: 'Fall' },
      { value: 'go3', label: 'Cross Country', group: 'Fall' },
      { value: 'go4', label: 'Basketball', group: 'Winter' },
      { value: 'go5', label: 'Swimming', group: 'Winter' },
      { value: 'go6', label: 'Baseball', group: 'Spring' },
      { value: 'go7', label: 'Track', group: 'Spring' },
      { value: 'go8', label: 'Tennis', group: 'Spring' }
    ]} />
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
