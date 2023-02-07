export class CropImage extends HTMLElement {
  initialized = false
  timer = 0
  nums = {}
  static cropAttributes = new Set(['imageaspect', 'cropleft', 'cropright', 'croptop', 'cropbottom', 'cropaspectnumerator', 'cropaspectdenominator'])
  static get observedAttributes () { return Array.from(this.cropAttributes) }
  static resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) entry.resize()
  })

  connectedCallback () {
    this.readAttributes()
    if (!this.initialized) {
      this.initialized = true
      this.attachShadow({ mode: 'open' })
      this.init()
    }
    this.copyAttributesToImg()
    this.applyAttributes()
  }

  disconnectedCallback () {
    if (!this.supportsContainerQueries) CropImage.resizeObserver.unobserve(this)
  }

  attributeChangedCallback (name) {
    this.readAttributes()
    this.applyAttributes()
  }

  resize () {
    this.applyAttributes()
  }

  readAttributes () {
    for (const attr of CropImage.cropAttributes) {
      this.nums[attr] = this.hasAttribute(attr) ? Number(this.getAttribute(attr)) : 0
    }
  }

  guessAR (ar) {
    for (const [num, den] of [[16, 9], [3, 2], [4, 3], [1, 1], [9, 16], [2, 3], [3, 4]]) {
      if (Math.abs(ar - (num / den)) < 0.02) return `${num} / ${den}`
    }
    return `${Math.round(ar * 1000)} / 1000`
  }

  copyAttributesToImg () {
    for (const attr of this.getAttributeNames()) {
      if (!CropImage.cropAttributes.has(attr) && attr !== 'style' && !attr.startsWith('data-')) this.img.setAttribute(attr, this.getAttribute(attr) || '')
    }
  }

  applyAttributes () {
    const cx = 100 * (this.nums.cropleft + (1 - this.nums.cropleft - this.nums.cropright) / 2)
    const cy = 100 * (this.nums.croptop + (1 - this.nums.croptop - this.nums.cropbottom) / 2)
    const rect = this.getBoundingClientRect()
    const style = this.getStyle()
    const width = `${100 / (1 - this.nums.cropleft - this.nums.cropright)}%`
    const height = `${100 / (1 - this.nums.croptop - this.nums.cropbottom)}%`
    cancelAnimationFrame(this.timer)
    this.timer = requestAnimationFrame(() => {
      this.img.style.transform = this.supportsContainerQueries
        ? `translate(clamp(-100% + 50cqw, -${cx}%, -50cqw), clamp(-100% + 50cqh, -${cy}%, -50cqh))`
        : `translate(clamp(-100% + ${rect.width / 2}px, -${cx}%, -${rect.width / 2}px), clamp(-100% + ${rect.height / 2}px, -${cy}%, -${rect.height / 2}px))`
      if (!this.supportsContainerQueries) {
        if (rect.width / rect.height > this.cropAspect) {
          this.img.style.width = 'auto'
          this.img.style.height = `max(${height}, ${rect.width / this.nums.imageaspect}px)`
        } else {
          this.img.style.height = 'auto'
          this.img.style.width = `max(${width}, ${rect.height * this.nums.imageaspect}px)`
        }
      } else {
        this.img.style.width = `max(${width}, ${100 * this.nums.imageaspect}cqh)`
        this.img.style.height = `max(${height}, ${100 / this.nums.imageaspect}cqw)`
      }
      this.styleelement.innerHTML = style
    })
  }

  getStyle () {
    this.cropAspect = (1 - this.nums.cropleft - this.nums.cropright) * this.nums.imageaspect / (1 - this.nums.croptop - this.nums.cropbottom)
    const cropRatio = this.nums.cropaspectnumerator && this.nums.cropaspectdenominator ? `${this.nums.cropaspectnumerator} / ${this.nums.cropaspectdenominator}` : this.guessAR(this.cropAspect)
    return `
      :host {
        padding-top: ${Math.round(100000 / this.cropAspect) / 1000}%;
      }
      @container (aspect-ratio > ${cropRatio}) {
        img {
          width: auto !important;
        }
      }
      @container (aspect-ratio <= ${cropRatio}) {
        img {
          height: auto !important;
        }
      }
    `
  }

  init () {
    this.supportsContainerQueries = CSS.supports('container-type', 'size')
    this.shadowRoot.innerHTML = `
      <style>
      :host {
        position: relative;
        display: block;
      }
      div {
        container-type: size;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      img {
        position: absolute;
        top: 50%;
        left: 50%;
      }
      </style>
      <style>
        ${this.getStyle()}
      </style>
      <div>
        <img>
      </div>
    `
    this.img = this.shadowRoot.querySelector('img')
    this.styleelement = this.shadowRoot.querySelectorAll('style')[1]
    if (!this.supportsContainerQueries) {
      CropImage.resizeObserver.observe(this)
    }
  }
}
