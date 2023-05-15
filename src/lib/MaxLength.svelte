<script lang="ts">
  export let maxlength: number
  export let value: string

  let overLimit = false

  $: message = getMaxlengthMessage(value.length)

  function getMaxlengthMessage (length: number) {
    overLimit = false
    if (length === 0) {
      return `${maxlength} characters allowed`
    } else if (length <= maxlength) {
      const diff = maxlength - length
      return `${diff} character${diff === 1 ? '' : 's'} remaining`
    } else {
      overLimit = true
      const diff = length - maxlength
      return `${diff} character${diff === 1 ? '' : 's'} over limit`
    }
  }
</script>

<div class:over={overLimit} aria-live="polite">{message}</div>

<style>
  div {
    font-size: 0.9em;
    color: #595959;
    line-height: 1.25em;
    margin-top: 0.4em;
  }
  .over {
    color: #9a3332;
    font-weight: bold;
  }
</style>