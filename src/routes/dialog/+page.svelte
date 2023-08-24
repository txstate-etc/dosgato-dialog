<script lang="ts">
  import { Dialog } from '$lib'
  let showTiny = false
  let showSmall = false
  let showNormal = false
  let showLarge = false
  let showXL = false
  </script>

  <button on:click={() => { showTiny = true }}>Tiny</button>
  {#if showTiny}
    <Dialog title="Tiny Dialog" on:continue={() => { showTiny = false }} size="tiny" expandable={true}>
      This is a tiny dialog.
    </Dialog>
  {/if}
  <button on:click={() => { showSmall = true }}>Small</button>
  {#if showSmall}
    <Dialog title="Small Dialog" on:continue={() => { showSmall = false }} size="small" expandable={true}>
      This is a Small dialog.
    </Dialog>
  {/if}
  <button on:click={() => { showNormal = true }}>Normal</button>
  {#if showNormal}
    <Dialog title="Normal Dialog" on:continue={() => { showNormal = false }} size="normal" expandable={true}>
      This is a Normal dialog.
    </Dialog>
  {/if}
  <button on:click={() => { showLarge = true }}>Large</button>
  {#if showLarge}
    <Dialog title="Large Dialog" on:continue={() => { showLarge = false }} size="large" expandable={true}>
      This is a Large dialog.
    </Dialog>
  {/if}
  <button on:click={() => { showXL = true }}>Extra Large</button>
  {#if showXL}
    <Dialog title="Extra Large Dialog" on:continue={() => { showXL = false }} size="xl" expandable={true}>
      This is an Extra Large dialog.
    </Dialog>
  {/if}
