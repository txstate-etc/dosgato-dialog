<div class="dialog-form-preamble">
  <slot />
</div>

<style>
  .dialog-form-preamble {
    padding: 1em 0;
    color: var(--dialog-muted-text, #595959);
    font-size: 0.9em;
  }

  :global(.tabs-panel) .dialog-form-preamble {
    margin-top: 0;
  }
</style>
