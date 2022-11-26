<script lang="ts">
  import FieldStandard from '../FieldStandard.svelte'
  import type { ColorPickerOption } from './colorpicker'
  import { Radio } from '$lib'
  import { randomid, shouldUseWhiteText } from 'txstate-utils'

  export let id: string | undefined = undefined
  let className = ''
  export { className as class }
  export let path: string
  export let options: ColorPickerOption[]
  export let addAllOption: boolean = false
  export let label: string = ''
  export let required = false
  export let notNull = false
  export let defaultValue: any = notNull ? (addAllOption ? 'alternating' : options[0].value) : undefined
  export let conditional: boolean|undefined = undefined
  export let helptext: string | undefined = undefined
  const groupid = randomid()

</script>

<FieldStandard bind:id descid={groupid} {path} {label} {required} {defaultValue} {conditional} {helptext} let:value let:valid let:invalid let:onBlur let:onChange let:messagesid let:helptextid>
  <div class="color-container {className}" role="radiogroup" aria-labelledby={groupid} class:invalid class:valid>
    {#if addAllOption}
      <label for={`${path}.alt`} class="colorsel alternating">
        <Radio id={`${path}.alt`} name={path} value="alternating" selected={value === 'alternating'} {onChange} {onBlur} {helptextid}/>
        <span class="alternating-bg">
          {#each options as option}
            <span style:background-color={option.color}></span>
          {/each}
        </span>
        <span class="picker-text">Alternating</span>
      </label>
    {/if}
    {#each options as option, idx (option.value) }
      {@const radioid = `${path}.${idx}`}
      <label for={radioid} class="colorsel">
        <Radio id={radioid} name={path} value={option.value} selected={value === option.value} {onChange} {onBlur} {helptextid}/>
        <span class="picker-text" style:background-color={option.color} class:dark={shouldUseWhiteText(option.color)}>{option.name || option.value}</span>
      </label>
    {/each}
  </div>
</FieldStandard>

<style>
  .color-container {
    display: grid;
    grid-gap: 10px;
    grid-template-columns: 1fr 1fr 1fr;
  }

  label.colorsel :global(input[type="radio"]) {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
  }

  label.colorsel :global(input[type="radio"] + span) {
    display: inline-block;
    padding: 1rem;
    width: 100%;
    text-align: center;
    white-space: nowrap;
    border: 1px solid #D1D1D1;
  }

  label.colorsel :global(input[type="radio"]:checked + span) {
    outline: 5px solid #93BBC4;
  }

  label.colorsel :global(input[type="radio"]:focus + span) {
    outline: 5px solid blue;
  }

  label.colorsel.alternating {
    position: relative;
  }

  label.colorsel.alternating span.alternating-bg {
    display: flex;
    padding: 0;
    height: 100%;
  }

  label.colorsel.alternating span.alternating-bg span {
    width: 100%;
  }

  label.colorsel.alternating span.picker-text {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  label .picker-text {
    font-weight: bold;
    letter-spacing: 0.5px;
    color: black;
    text-shadow: 1px 1px 1px rgba(255, 255, 255, 0.6), 1px -1px 1px rgba(255, 255, 255, 0.6), -1px 1px 1px rgba(255, 255, 255, 0.6), -1px -1px 1px rgba(255, 255, 255, 0.6);
  }
  label .picker-text.dark, label.alternating .picker-text {
    color: white;
    text-shadow: 1px 1px 1px #222, 1px -1px 1px #222, -1px 1px 1px #222, -1px -1px 1px #222;
  }
</style>
