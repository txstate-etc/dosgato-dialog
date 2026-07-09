// jsdom does not implement ResizeObserver, used by @txstate-mws/svelte-components actions
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe () {}
    unobserve () {}
    disconnect () {}
  }
}
