<script lang="ts">
  import { passActions, type HTMLActionEntry } from '@txstate-mws/svelte-components'
  import { dateSerialize, datetimeSerialize } from '@txstate-mws/svelte-forms'
  import { isNotBlank } from 'txstate-utils'

  let className = ''
  export { className as class }
  export let name: string
  export let value: string
  export let type: string = 'text'
  export let allowlastpass = false
  export let placeholder: string | undefined = undefined
  export let maxlength: number | undefined = undefined
  export let min: string | Date | { toJSDate: () => Date } | number | undefined = undefined
  export let max: string | Date | { toJSDate: () => Date } | number | undefined = undefined
  export let step: number | undefined = undefined
  export let id: string | undefined = undefined
  export let disabled = false
  export let autocomplete = 'off'
  export let extradescid: string | undefined = undefined
  export let messagesid: string | undefined = undefined
  export let helptextid: string | undefined = undefined
  export let valid = false
  export let invalid = false
  export let onChange: any
  export let onBlur: any
  export let onSelect: any = undefined
  export let use: HTMLActionEntry[] = []
  export let inputelement: HTMLInputElement = undefined as any

  $: descby = [messagesid, helptextid, extradescid].filter(isNotBlank).join(' ')

  function resolveMinMax (dt: any) {
    if (typeof dt === 'undefined') return undefined
    if ('toJSDate' in dt) dt = dt.toJSDate()
    if (dt instanceof Date) return type === 'date' ? dateSerialize(dt) : datetimeSerialize(dt)
    return dt
  }
  $: minStr = resolveMinMax(min)
  $: maxStr = resolveMinMax(max)
</script>

<!-- svelte-ignore a11y-autocomplete-valid -->
<input bind:this={inputelement} {type} {id} {autocomplete} {placeholder} class={className} data-lpignore={!allowlastpass} {name} {value} {disabled} {maxlength} min={minStr} max={maxStr} {step} class:valid class:invalid aria-invalid={invalid} aria-describedby={isNotBlank(descby) ? descby : null} on:change={onChange} on:select={onSelect} on:blur={onBlur} on:keyup={onChange} use:passActions={use}>
