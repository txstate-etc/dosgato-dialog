<script lang="ts">
  import { nullableSerialize, nullableDeserialize } from '@txstate-mws/svelte-forms'
  import { randomid } from 'txstate-utils'
  import FieldStandard from './FieldStandard.svelte'
  import Radio from './Radio.svelte'
  let className = ''
  export { className as class }
  export let id: string | undefined = undefined
  export let path: string
  export let label: string = ''
  export let notNull = false
  export let choices: { label?: string, value: any, disabled?: boolean }[]
  export let defaultValue: any = notNull ? choices[0].value : undefined
  export let conditional: boolean|undefined = undefined
  export let horizontal = false
  const groupid = randomid()
  const width = '100%'
</script>

<FieldStandard bind:id {groupid} {label} {path} {defaultValue} {conditional} serialize={!notNull && nullableSerialize} deserialize={!notNull && nullableDeserialize} let:value let:valid let:invalid let:onBlur let:onChange>
  <div class="dialog-radio {className}" class:horizontal role="radiogroup" aria-labelledby={groupid} class:invalid>
    {#each choices as choice, idx}
      {@const radioid = `${path}.${idx}`}
      <label for={radioid} style:width>
        <Radio id={radioid} name={path} value={choice.value} selected={value === choice.value} disabled={choice.disabled} {onChange} {onBlur} />
        <span>{choice.label || (typeof choice.value === 'string' ? choice.value : '')}</span>
      </label>
    {/each}
  </div>
</FieldStandard>

<style>
  .dialog-radio {
    padding: 0.2em 0;
  }
  label {
    margin-bottom: 0.7em;
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }
  label:last-child {
    margin-bottom: 0;
  }
  span {
    margin-left: 0.45em;
    max-width: calc(100% - 1.6em);
  }
  label :global(input[type="checkbox"]) {
    transform: none;
  }
</style>
