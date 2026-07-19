import { flushSync, mount, unmount } from 'svelte'
import { afterEach, beforeEach, expect, it } from 'vitest'
import DatesDemo from '../src/routes/dates/+page.svelte'

async function settle (ms = 0) {
  await new Promise(resolve => setTimeout(resolve, ms))
  flushSync()
}

function setInput (input, value) {
  input.value = value
  // svelte 5 delegates change events to the mount root, so the event must bubble
  input.dispatchEvent(new Event('change', { bubbles: true }))
  flushSync()
}

let target, component
beforeEach(async () => {
  target = document.createElement('div')
  document.body.appendChild(target)
  component = mount(DatesDemo, { target })
  flushSync()
  // FormDialog fields register with the store asynchronously before rendering
  for (let i = 0; i < 3; i++) await settle(10)
})

afterEach(() => {
  unmount(component)
  target.remove()
})

const dataJson = () => target.querySelector('aside pre').textContent

it('FieldDate stores an entered date anchored at noon local time and serializes with a timezone offset', async () => {
  const input = document.body.querySelector('input[name="date"]')
  expect(input).toBeDefined()
  expect(input.type).toBe('date')

  setInput(input, '2026-07-04')
  await settle(10)

  expect(dataJson()).toContain('"date": "2026-07-04T12:00:00.000')
})

it('FieldDate beginningOfDay and endOfDay record the boundaries of the day instead of noon', async () => {
  setInput(document.body.querySelector('input[name="date_beginning"]'), '2026-07-04')
  setInput(document.body.querySelector('input[name="date_end"]'), '2026-07-04')
  await settle(10)

  expect(dataJson()).toContain('"date_beginning": "2026-07-04T00:00:00.000')
  expect(dataJson()).toContain('"date_end": "2026-07-04T23:59:59.999')
})

it('FieldDate shows Clear Field only when a clearable field has a value, and clicking it empties input and data', async () => {
  expect(document.body.querySelectorAll('button.dialog-field-clear').length).toBe(0)

  const input = document.body.querySelector('input[name="date_clearable"]')
  setInput(input, '2026-07-04')
  await settle(10)
  expect(dataJson()).toContain('"date_clearable"')

  const clearbuttons = document.body.querySelectorAll('button.dialog-field-clear')
  expect(clearbuttons.length).toBe(1)

  clearbuttons[0].click()
  await settle(10)

  expect(input.value).toBe('')
  expect(dataJson()).not.toContain('"date_clearable"')
  expect(document.body.querySelectorAll('button.dialog-field-clear').length).toBe(0)
})

it('FieldDateTime stores an entered datetime with hour and minute preserved', async () => {
  const input = document.body.querySelector('input[name="datetime"]')
  expect(input).toBeDefined()
  expect(input.type).toBe('datetime-local')

  setInput(input, '2026-07-04T13:30')
  await settle(10)

  expect(dataJson()).toContain('"datetime": "2026-07-04T13:30:00.000')
})

it('FieldDateTime removes its value from the form data when the input becomes unparseable', async () => {
  const input = document.body.querySelector('input[name="datetime"]')

  setInput(input, '2026-07-04T13:30')
  await settle(10)
  expect(dataJson()).toContain('"datetime":')

  setInput(input, 'not a datetime')
  await settle(10)
  expect(dataJson()).not.toContain('"datetime":')
})

it('FieldDateTime Clear Field empties both the input element and the form data', async () => {
  const input = document.body.querySelector('input[name="datetime_clearable"]')
  setInput(input, '2026-07-04T13:30')
  await settle(10)
  expect(dataJson()).toContain('"datetime_clearable"')

  const clearbutton = document.body.querySelector('button.dialog-field-clear')
  expect(clearbutton).toBeDefined()
  clearbutton.click()
  await settle(10)

  expect(input.value).toBe('')
  expect(dataJson()).not.toContain('"datetime_clearable"')
})
