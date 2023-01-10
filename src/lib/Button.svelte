<script lang="ts">
  import type { IconifyIcon } from '@iconify/svelte'
  import Icon from './Icon.svelte'

  export let type: 'button'|'submit' = 'button'
  export let disabled = false
  export let compact = false
  export let cancel = false
  export let destructive = false
  export let secondary = false
  export let describedby: string|undefined = undefined
  export let element: HTMLElement|undefined = undefined
  export let icon: IconifyIcon|undefined = undefined
  let className: string | undefined = undefined
  export { className as class }
</script>

<button {disabled} bind:this={element} {type} class="reset {className ?? ''}" class:cancel class:destructive class:secondary class:compact aria-describedby={describedby} on:click><Icon {icon} width="1.3em" /><span><slot /></span></button>

<style>
  button.reset {
    padding: 0.5em 1em;
    border: 0;
    border-radius: 0.25em;
    background-color: var(--dg-button-bg, #501214);
    color: var(--dg-button-text, white);
    cursor: pointer;
    display: flex;
    align-items: center;
    line-height: 1;
  }
  button.reset.compact {
    padding: 0.1em;
  }
  button.reset[disabled] {
    opacity: 0.6;
    cursor: default;
  }

  button.reset > :global(svg:last-child) {
    margin-left: 0.3em;
    margin-right: -0.3em;
  }
  button.reset > :global(svg:first-child) {
    margin-left: -0.3em;
    margin-right: 0.3em;
  }

  button.reset:not([disabled]):hover {
    background-color: var(--dg-button-hover-bg, #622a2c);
    color: var(--dg-button-hover-text, white);
  }

  button.secondary {
    background-color: var(--dg-button-secondary-bg, rgb(18, 184, 134));
    color: var(--dg-button-secondary-text, white);
  }
  button.secondary:not([disabled]):hover {
    background-color: var(--dg-button-secondary-hover-bg, rgb(12, 166, 120));
    color: var(--dg-button-secondary-hover-text, white);
  }

  button.cancel {
    background-color: var(--dg-button-cancel-bg, #808080);
    color: var(--dg-button-cancel-text, white);
  }
  button.cancel:not([disabled]):hover {
    background-color: var(--dg-button-cancel-hover-bg, #595959);
    color: var(--dg-button-cancel-hover-text, white);
  }

  button.destructive {
    background-color: var(--dg-button-delete-bg, rgb(250, 82, 82));
    color: var(--dg-button-delete-text, white);
  }
  button.destructive:not([disabled]):hover {
    background-color: var(--dg-button-delete-hover-bg, rgb(240, 62, 62));
    color: var(--dg-button-delete-hover-text, white);
  }
</style>
