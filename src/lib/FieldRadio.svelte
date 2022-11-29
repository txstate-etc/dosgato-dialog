<script lang="ts">
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
  export let required = false
  export let horizontal = false
  export let helptext: string | undefined = undefined
  export let number = false
  export let date = false
  export let datetime = false
  export let serialize: ((value: any) => string)|undefined = undefined
  export let deserialize: ((value: string) => any)|undefined = undefined
  const groupid = randomid()
  const width = '100%'
</script>

<FieldStandard bind:id descid={groupid} {label} {path} {required} {defaultValue} {conditional} {helptext} {notNull} {number} {date} {datetime} {serialize} {deserialize} let:value let:valid let:invalid let:onBlur let:onChange let:helptextid let:serialize>
  <div class="dialog-radio {className}" class:horizontal role="radiogroup" aria-labelledby={groupid} class:invalid>
    {#each choices as choice, idx}
      {@const radioid = `${path}.${idx}`}
      {@const serializedValue = serialize(choice.value)}
      <label for={radioid} style:width>
        <Radio id={radioid} name={path} value={serializedValue} selected={value === serializedValue} disabled={choice.disabled} {onChange} {onBlur} {helptextid}/>
        <span>{choice.label || serializedValue}</span>
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
