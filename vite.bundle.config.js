import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: {
        'code/_ts-env': 'src/lib/code/_ts-env.ts',
        'code/_graphql-env': 'src/lib/code/_graphql-env.ts'
      },
      formats: ['es'],
      fileName: (_, entryName) => `${entryName}.js`
    },
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      external: [
        /^codemirror/,
        /^@codemirror\//,
        'graphql',
        /^svelte/
      ]
    }
  }
})
