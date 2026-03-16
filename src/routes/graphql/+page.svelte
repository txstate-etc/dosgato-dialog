<script lang="ts">
  import type { FormStore } from '@txstate-mws/svelte-forms'
  import { onMount } from 'svelte'
  import { FieldGraphQLEditor, FormDialog } from '$lib'
  import type { GraphQLSchema } from 'graphql'

  let store: FormStore
  let schema: GraphQLSchema | undefined

  onMount(async () => {
    const { buildSchema } = await import('graphql')
    schema = buildSchema(`
      type Query {
        books(limit: Int, offset: Int): [Book!]!
        book(id: ID!): Book
        authors(limit: Int, offset: Int): [Author!]!
        author(id: ID!): Author
        searchBooks(title: String!): [Book!]!
      }

      type Mutation {
        createBook(input: BookInput!): Book!
        updateBook(id: ID!, input: BookInput!): Book!
        deleteBook(id: ID!): Boolean!
        createAuthor(input: AuthorInput!): Author!
        updateAuthor(id: ID!, input: AuthorInput!): Author!
        deleteAuthor(id: ID!): Boolean!
      }

      type Book {
        id: ID!
        title: String!
        isbn: String
        publishedYear: Int
        genre: Genre
        author: Author!
        reviews: [Review!]!
      }

      type Author {
        id: ID!
        name: String!
        bio: String
        birthYear: Int
        books: [Book!]!
      }

      type Review {
        id: ID!
        rating: Int!
        comment: String
        reviewer: String!
        book: Book!
      }

      input BookInput {
        title: String!
        isbn: String
        publishedYear: Int
        genre: Genre
        authorId: ID!
      }

      input AuthorInput {
        name: String!
        bio: String
        birthYear: Int
      }

      enum Genre {
        FICTION
        NON_FICTION
        MYSTERY
        SCIENCE_FICTION
        FANTASY
        BIOGRAPHY
        HISTORY
      }
    `)
  })

  async function submit (data: any) {
    return { success: true, data, messages: [] }
  }
</script>

<svelte:head><title>GraphQL Editor Demo</title></svelte:head>
<h1>GraphQL Editor Demo</h1>

<main>
  <FormDialog bind:store title="GraphQL Query" {submit} let:data>
    <FieldGraphQLEditor path="query" label="Query" {schema} rows={12} />
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
