// jsdom does not implement ResizeObserver, used by @txstate-mws/svelte-components actions
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe () {}
    unobserve () {}
    disconnect () {}
  }
}

// jsdom does not implement IntersectionObserver, used by the Tree component to lazy-render
// nodes - fire immediately so every observed node renders
if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = class IntersectionObserver {
    constructor (callback) {
      this.callback = callback
    }

    observe (target) {
      this.callback([{ isIntersecting: true, target }], this)
    }

    unobserve () {}
    disconnect () {}
  }
}

// jsdom does not implement scrollIntoView, used by the Tree component on focused nodes
if (typeof Element.prototype.scrollIntoView === 'undefined') {
  Element.prototype.scrollIntoView = () => {}
}

// jsdom only implements requestAnimationFrame in pretendToBeVisual mode, the Tree
// component waits on it before mounting rows
if (typeof globalThis.requestAnimationFrame === 'undefined') {
  globalThis.requestAnimationFrame = callback => setTimeout(() => callback(Date.now()), 0)
  globalThis.cancelAnimationFrame = id => { clearTimeout(id) }
}
