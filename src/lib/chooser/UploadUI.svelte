<script lang="ts">
  import trashLight from '@iconify-icons/ph/trash-light'
  import { roundTo, unique } from 'txstate-utils'
  import { createEventDispatcher } from 'svelte'
  import { Dialog, FileIcon, Icon, mimeAccepted, type MimeAccept } from '$lib'

  export let title: string
  export let helptext: string | undefined = undefined
  export let maxFiles = 200
  export let escapable = true
  export let mimeWhitelist: string[] = []
  export let mimeBlacklist: string[] = []
  /**
   * Restrict which mime types may be uploaded. A list of mime types, a trailing
   * wildcard like 'image/*' is supported.
   */
  export let acceptMime: MimeAccept | undefined = undefined
  /**
   * Perform the actual upload. Receives the chosen files, a progress callback
   * expecting a ratio between 0 and 1, and an AbortSignal that fires if the user
   * cancels the upload in progress. Implementations that ignore the signal simply
   * cannot be aborted.
   */
  export let uploader: (files: File[], progress: (ratio: number) => void, signal: AbortSignal) => Promise<unknown>
  $: whitelist = new Set(mimeWhitelist)
  $: blacklist = new Set(mimeBlacklist)

  const dispatch = createEventDispatcher()

  let dragover = 0
  let uploadList: File[] = []
  let uploadLocked = false
  let uploadProgress = 0
  let uploadError: string | undefined
  let abortController: AbortController | undefined

  let tooManyFiles = false

  function fileAllowed (file: File) {
    return mimeAccepted(acceptMime, file.type) && (!whitelist.size || whitelist.has(file.type)) && !blacklist.has(file.type)
  }
  $: anyDisallowed = uploadList.some(f => !fileAllowed(f))

  function onUploadEnter (e: DragEvent) {
    if (e.dataTransfer?.items.length) dragover += 1
  }

  function onUploadLeave (e: DragEvent) {
    if (e.dataTransfer?.items.length) dragover -= 1
  }

  function onUploadDrop (e: DragEvent) {
    e.preventDefault()
    dragover = 0
    if (!uploadLocked && e.dataTransfer?.items?.length) {
      tooManyFiles = e.dataTransfer?.items?.length > maxFiles
      uploadList = unique(uploadList.concat(Array.from(e.dataTransfer.files)), 'name').slice(-1 * maxFiles)
    }
  }

  function onUploadChange (e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
    const files = e.currentTarget.files
    if (files?.length) {
      tooManyFiles = files.length > maxFiles
      uploadList = unique(Array.from(files).concat(uploadList), 'name').slice(-1 * maxFiles)
    }
    e.currentTarget.value = ''
  }

  async function onUploadSubmit () {
    if (uploadLocked || anyDisallowed) return
    uploadLocked = true
    abortController = new AbortController()
    try {
      const fileCount = uploadList.length
      await uploader(uploadList, ratio => { uploadProgress = ratio }, abortController.signal)
      uploadList = []
      uploadError = undefined
      dispatch('saved', { fileCount })
    } catch (e: any) {
      if (abortController.signal.aborted) {
        uploadList = []
        uploadError = undefined
        dispatch('escape')
        return
      }
      uploadError = e.message
    } finally {
      uploadLocked = false
      uploadProgress = 0
      abortController = undefined
    }
  }

  function onUploadEscape () {
    if (uploadLocked) {
      if (escapable) abortController?.abort()
      return
    }
    if (escapable) {
      uploadList = []
      uploadError = undefined
      dispatch('escape')
    }
  }

  function onDeleteFile (file: File) {
    return () => {
      uploadList = uploadList.filter(f => f !== file)
    }
  }
</script>

<Dialog {title} disabled={!uploadList.length || anyDisallowed} cancelText="Cancel" continueText="Upload" on:escape={onUploadEscape} on:continue={onUploadSubmit}>
  {#if uploadLocked}
    <progress value={uploadProgress} aria-label="Assets Uploading">{roundTo(100 * uploadProgress)}%</progress>
  {:else}
    {#if uploadError}<div class="error">{uploadError}</div>{/if}
    <form method="POST" enctype="multipart/form-data"
      on:submit|preventDefault|stopPropagation={onUploadSubmit}
      class="uploader" class:dragover={dragover > 0}
      on:dragenter={onUploadEnter} on:dragleave={onUploadLeave}
      on:dragover|preventDefault={() => {}} on:drop={onUploadDrop}
    >
      <input type="file" id="uploader_input" multiple accept={acceptMime?.join(',') || undefined} on:change={onUploadChange}>
      <label for="uploader_input">Choose or drag {$$props.maxFiles ? (maxFiles > 1 ? `up to ${maxFiles}` : 'a') : ''} file{maxFiles === 1 ? '' : 's'}</label>
      <ul>
        {#each uploadList as file (file.name)}
          <li>
            <FileIcon width="1.5em" mime={file.type} inline />{file.name}{#if maxFiles > 1}<button type="button" on:click={onDeleteFile(file)}><Icon icon={trashLight} width="1.5em" hiddenLabel="Remove File" inline /></button>{/if}
            {#if !fileAllowed(file)}
              <div class="error">File type not allowed.</div>
            {/if}
          </li>
        {/each}
      </ul>
      {#if tooManyFiles}
        <div class="error left">Only {maxFiles} file{#if maxFiles !== 1}s{/if} allowed.</div>
      {/if}
    </form>
    {helptext ?? ''}
  {/if}
</Dialog>

<style>
  .uploader {
    border: 2px dashed #666666;
    border-radius: 0.5em;
    text-align: center;
    padding: 1em;
    min-height: 10em;
    margin-bottom: 0.5em;
  }
  .uploader.dragover {
    border-color: #333333;
  }
  .uploader ul {
    padding: 0;
    margin: 0;
    list-style: none;
    text-align: left;
  }
  progress {
    width: 80%;
    margin-left: 10%;
  }
  input[type="file"] {
    opacity: 0;
    display: block;
  }
  label {
    display: inline-block;
    width: 50%;
    padding: 1em;
    background: #ccc;
    cursor: pointer;
    border-radius: 5px;
    border: 1px solid #ccc;
    margin-bottom: 1em;
  }
  input:focus + label {
    outline: 2px solid blue;
  }
  .error {
    color: red;
  }
  .error.left {
    text-align: left;
  }
  button {
    border: 0;
    background: none;
    padding: 0.5em;
    cursor: pointer;
  }
  li {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }
  li div {
    width: 100%;
  }
</style>
