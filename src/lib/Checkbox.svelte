<script lang="ts">
  import { isNotBlank } from 'txstate-utils'

  export let id: string|undefined = undefined
  export let name: string
  export let value: boolean
  export let onChange: any = undefined
  export let onBlur: any = undefined
  export let descid: string|undefined = undefined
  export let messagesid: string|undefined = undefined
  export let disabled = false
  export let valid = false
  export let invalid = false
  export let inputelement: HTMLInputElement = undefined
  export let helptextid: string|undefined = undefined

  $: descby = [descid, messagesid, helptextid].filter(isNotBlank).join(' ')
</script>

<input bind:this={inputelement} {id} type="checkbox" {name} class:valid class:invalid {disabled} aria-describedby={descby} bind:checked={value} on:change={onChange} on:blur={onBlur}>

<style>
input, input:before, input:after {
  box-sizing: border-box;
}

input[type="checkbox"] {
  -webkit-appearance: none;
  appearance: none;
  background-color: var(--dialog-checkbox-bg, #ffffff);
  margin: 0;

  font: inherit;
  color: var(--dialog-checkbox-border, currentColor);
  width: 1.15em;
  height: 1.15em;
  border: 0.15em solid currentColor;
  border-radius: 0.15em;
  transform: translateY(-0.075em);

  display: inline-grid;
  place-content: center;
}

input[type="checkbox"]::before {
  content: "";
  width: 0.65em;
  height: 0.65em;
  clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
  transform: scale(0);
  transform-origin: bottom left;
  transition: 120ms transform ease-in-out;
  box-shadow: inset 1em 1em var(--dialog-checkbox-color, currentColor);
  /* Windows High Contrast Mode */
  background-color: CanvasText;
}

input[type="checkbox"]:checked::before {
  transform: scale(1);
}

input[type="checkbox"]:focus {
  outline: max(2px, 0.15em) solid var(--dialog-checkbox-focus, #4D90FE);
  outline-offset: max(2px, 0.15em);
}

input[type="checkbox"]:disabled {
  --dialog-checkbox-color: var(--dialog-checkbox-disabled, #999999);

  color: var(--dialog-checkbox-color);
  cursor: not-allowed;
}
</style>
