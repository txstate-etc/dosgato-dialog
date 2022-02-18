<script lang="ts">
  export let id: string|undefined = undefined
  export let name: string
  export let value: string
  export let selected = false
  export let onChange: any = undefined
  export let onBlur: any = undefined
  export let messagesid: string|undefined = undefined
  export let disabled = false
  export let valid = false
  export let invalid = false
</script>

<input {id} type="radio" {name} class:valid class:invalid checked={selected} {disabled} aria-describedby={messagesid} {value} on:change={onChange} on:blur={onBlur}>

<style>
input, input:before, input:after {
  box-sizing: border-box;
}

input[type="radio"] {
  -webkit-appearance: none;
  appearance: none;
  background-color: var(--dialog-checkbox-bg, #ffffff);
  margin: 0;

  font: inherit;
  color: var(--dialog-checkbox-border, currentColor);
  width: 1.15em;
  height: 1.15em;
  border: 0.15em solid currentColor;
  border-radius: 50%;
  transform: translateY(-0.075em);

  display: inline-grid;
  place-content: center;
}

input[type="radio"]::before {
  content: "";
  width: 0.65em;
  height: 0.65em;
  border-radius: 50%;
  transform: scale(0);
  transition: 120ms transform ease-in-out;
  box-shadow: inset 1em 1em var(--dialog-checkbox-color, currentColor);
  /* Windows High Contrast Mode */
  background-color: CanvasText;
}

input[type="radio"]:checked::before {
  transform: scale(1);
}

input[type="radio"]:focus {
  outline: max(2px, 0.15em) solid var(--dialog-checkbox-focus, #4D90FE);
  outline-offset: max(2px, 0.15em);
}

input[type="radio"]:disabled {
  --dialog-checkbox-color: var(--dialog-checkbox-disabled, #999999);

  color: var(--dialog-checkbox-color);
  cursor: not-allowed;
}
</style>
