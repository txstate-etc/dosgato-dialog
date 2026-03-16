<script lang="ts">
  import type { FormStore } from '@txstate-mws/svelte-forms'
  import { FieldTypeScriptEditor, FormDialog } from '$lib'

  let store: FormStore

  const preamble = `
interface Book {
  id: string
  title: string
  isbn?: string
  publishedYear?: number
  genre?: Genre
  author: Author
}

interface Author {
  id: string
  name: string
  bio?: string
  birthYear?: number
  books: Book[]
}

enum Genre {
  Fiction = 'FICTION',
  NonFiction = 'NON_FICTION',
  Mystery = 'MYSTERY',
  ScienceFiction = 'SCIENCE_FICTION',
  Fantasy = 'FANTASY',
  Biography = 'BIOGRAPHY',
  History = 'HISTORY'
}

declare function getBooks(): Promise<Book[]>
declare function getAuthor(id: string): Promise<Author>
`

  async function submit (data: any) {
    return { success: true, data, messages: [] }
  }
</script>

<svelte:head><title>TypeScript Editor Demo</title></svelte:head>
<h1>TypeScript Editor Demo</h1>

<main>
  <FormDialog bind:store title="TypeScript" {submit} let:data>
    <FieldTypeScriptEditor path="code" label="Code" {preamble} sandbox rows={12} />
    <svelte:fragment slot="submit" let:saved>
      <button>Save</button>
      {#if saved}Save successful!{/if}
    </svelte:fragment>
  </FormDialog>
</main>
<aside>
  <pre>{JSON.stringify($store?.data, null, 2)}</pre>
</aside>

<style>
  main {
    padding-right: max(30%, 10em);
  }
  aside {
    position: absolute;
    top: 3.7em;
    right: 0;
    width: 30%;
    min-width: 10em;
    overflow-x: scroll;
  }
  aside pre {
    font-size: 0.75em;
  }
</style>
