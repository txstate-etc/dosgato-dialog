<script lang="ts">
  import { isNotBlank } from 'txstate-utils'

  export let id: string | undefined = undefined
  export let name: string
  export let value: boolean
  export let onChange: any = undefined
  export let onBlur: any = undefined
  export let onKeydown: any = undefined
  export let descid: string | undefined = undefined
  export let disabled = false
  export let valid = false
  export let invalid = false
  export let inputelement: HTMLInputElement = undefined as any
  export let indeterminate = false
  export let tabindex: number | undefined = undefined

  $: if (inputelement) {
    if (!indeterminate && inputelement.indeterminate) {
      inputelement.style.setProperty('--cb-transition', 'none')
      inputelement.indeterminate = false
      // restore after one frame so checked transitions still animate
      requestAnimationFrame(() => { inputelement.style.removeProperty('--cb-transition') })
    } else {
      inputelement.indeterminate = indeterminate
    }
  }
</script>

<input bind:this={inputelement} {id} type="checkbox" {name} class:valid class:invalid {disabled} aria-describedby={descid} {tabindex} bind:checked={value} on:change={onChange} on:blur={onBlur} on:keydown={onKeydown}>

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
  transition: var(--cb-transition, 120ms transform ease-in-out);
  box-shadow: inset 1em 1em var(--dialog-checkbox-color, currentColor);
  /* Windows High Contrast Mode */
  background-color: CanvasText;
}

input[type="checkbox"]:checked::before {
  transform: scale(1);
  transition: 120ms transform ease-in-out;
}

input[type="checkbox"]:indeterminate::before {
  clip-path: polygon(10% 40%, 10% 60%, 90% 60%, 90% 40%);
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
