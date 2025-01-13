<script lang="ts">
  import { FORM_CONTEXT, FORM_INHERITED_PATH, type FormStore } from '@txstate-mws/svelte-forms'
  import { getContext, onMount } from 'svelte'
  import { get, isNotBlank, isNotNull, keyby, randomid } from 'txstate-utils'
  import { Radio } from '$lib'
  import FieldStandard from '../FieldStandard.svelte'
  import type { ColorPickerOption } from './colorpicker'
    import { ScreenReaderOnly } from '@txstate-mws/svelte-components';

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
  export let conditional: boolean | undefined = undefined
  export let helptext: string | undefined = undefined
  const groupid = randomid()

  const store = getContext<FormStore>(FORM_CONTEXT)
  const inheritedPath = getContext<string>(FORM_INHERITED_PATH)
  const finalPath = [inheritedPath, path].filter(isNotBlank).join('.')

  $: colorsByValue = keyby(options, 'value')

  async function reactToOptions (..._: any[]) {
    const val = get($store.data, finalPath)
    if (!val) return
    if (!options.length) await store.setField(finalPath, addAllOption ? 'alternating' : undefined)
    else if (val !== 'alternating' && !options.some(o => o.value === val)) await store.setField(finalPath, notNull ? options[0].value : (addAllOption ? 'alternating' : undefined))
  }
  $: reactToOptions(options).catch(console.error)
  onMount(reactToOptions)
</script>

<FieldStandard bind:id descid={groupid} {path} {label} {required} {defaultValue} {conditional} {helptext} let:value let:valid let:invalid let:onBlur let:onChange let:messagesid let:helptextid let:setVal>
  <div class="container-query-wrapper">
    <div class="color-container {className}" role="radiogroup" aria-labelledby={groupid} class:invalid class:valid>
      {#if addAllOption}
        <label for={`${groupid}.alt`} class="colorsel alternating">
          <Radio id={`${groupid}.alt`} name={groupid} value="alternating" selected={value === 'alternating'} {onChange} {onBlur} {helptextid}/>
          <div class="picker-text">
            <ScreenReaderOnly>Alternating</ScreenReaderOnly>
            <div class="alternating-bg">
              {#each options as option (option.value)}
                <div style:background-color={option.color} style:flex-basis={`calc(100% / ${options.length})`}></div>
              {/each}
            </div>
          </div>
        </label>
      {/if}
      {#each options as option, idx (option.value) }
        {@const radioid = `${groupid}.${idx}`}
        <label for={radioid} class="colorsel" title={option.name || option.value}>
          <Radio id={radioid} name={groupid} value={option.value} selected={value === option.value} {onChange} {onBlur} {helptextid}/>
          <div class="picker-text" style:background-color={option.color}>
            <ScreenReaderOnly>{option.name || option.value}</ScreenReaderOnly>
          </div>
        </label>
      {/each}
    </div>
    {#if options.length && isNotNull(get($store.data, finalPath))}
      <div>
        Selected Color: <span class="selected-color">{get($store.data, finalPath) === 'alternating' ? 'Alternating' : (colorsByValue[get($store.data, finalPath)]?.name ?? get($store.data, finalPath))}</span>
      </div>
    {/if}
  </div>
</FieldStandard>

<style>
  .container-query-wrapper {
    container-type: inline-size;
    container-name: color-picker-container;
  }
  .color-container {
    display: flex;
    flex-wrap: wrap;
    gap: 1em;
    margin-bottom: 1em;
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
  label.colorsel :global(input[type="radio"] + div.picker-text) {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 50px;
    height: 50px;
    border-radius: 100%;
    text-align: center;
    white-space: nowrap;
    border: 1px solid #D1D1D1;
  }

  label.colorsel :global(input[type="radio"]:checked + div.picker-text) {
    outline: 5px solid #93BBC4;
  }

  label.colorsel :global(input[type="radio"]:focus + div.picker-text) {
    outline: 5px solid blue;
  }
  label.colorsel.alternating .picker-text {
    overflow: hidden;
  }
  label.colorsel.alternating .picker-text .alternating-bg {
    display: flex;
    height: 100%;
    width: 100%;
  }
</style>
