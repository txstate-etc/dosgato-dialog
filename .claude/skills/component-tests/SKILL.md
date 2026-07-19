---
name: component-tests
description: How to write vitest tests for this component library.
---

# Component tests via demo routes

Tests live in `tests/*.test.js` (vitest + jsdom, config in `vitest.config.js`). Each demo route under `src/routes/<component>/+page.svelte` demonstrates a component and doubles as a test fixture.

## Preference order

New tests start from a route: when the component under test has no demo route, create `src/routes/<component>/+page.svelte` demonstrating the states you're about to test, then write the test against it. Every fixture should leave a human-browsable demo behind.

1. **Mount the demo route directly.** Routes are plain Svelte components — import `../src/routes/<name>/+page.svelte` and `mount()` it. Prefer this over writing a bespoke harness; it keeps demos and tests in sync.
2. **Split when the test needs control.** If a test needs varied props, mock injection, or internal access (store, call logs), extract the demo body into a shared component (e.g. `src/demo/XDemo.svelte`) with exported props and accessor functions. The route stays a thin wrapper around it; the test imports the shared component. Don't duplicate a demo into a test-only harness.
3. Test-only harnesses in `tests/*.svelte` are a last resort for setups no human would benefit from browsing.

## Constraints on routes

- Never import `$app/*` or `$env` in routes or `src/demo` — that's what keeps them mountable outside SvelteKit.
- Routes must stay useful to a human tester on `npm run dev`: descriptive labels for every state being demonstrated, realistic shared demo data (`src/demo/DemoChooserAPI.ts` etc.), and an `<aside><pre>{JSON.stringify($store?.data, null, 2)}</pre></aside>` so form state is visible. Tests may assert against that aside — it's the serialized form data.

## Mechanics

- Svelte 5, no runes. Use `mount`/`unmount`/`flushSync` from `svelte`.
- `tests/setup.js` shims ResizeObserver, IntersectionObserver, scrollIntoView, requestAnimationFrame for jsdom. Add new shims there.
- Svelte 5 delegates DOM events to the mount root: dispatched events need `{ bubbles: true }`.
- Dialogs/modals may portal outside the mount target — query `document.body`.
- Field registration and chooser init are async: settle with repeated `await new Promise(r => setTimeout(r, 10)); flushSync()` (see existing tests).
