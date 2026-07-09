import { flushSync, mount, unmount } from 'svelte'
import { get } from 'svelte/store'
import { expect, it } from 'vitest'
import Harness from './ConditionalMultipleHarness.svelte'

it('FieldMultiple conditional=false removes the field from the DOM and deletes/stashes its data, restoring on reshow', async () => {
  const target = document.createElement('div')
  document.body.appendChild(target)
  const component = mount(Harness, { target })
  flushSync()
  const store = component.getStore()

  // minLength defaults to 1, so one empty row exists after mount
  expect(get(store).data.contacts).toHaveLength(1)

  await store.setField('contacts.0.email', 'a@b.co')
  flushSync()
  expect(get(store).data.contacts).toEqual([{ email: 'a@b.co' }])
  expect(target.textContent).toContain('Contacts')

  component.setShow(false)
  flushSync()
  // chrome and rows are hidden
  expect(target.textContent).not.toContain('Contacts')
  // per the svelte-forms conditional contract, the data must be deleted from the
  // payload and stashed in conditionalData so it can be restored on reshow
  expect(get(store).data.contacts).toBeUndefined()
  expect(get(store).conditionalData.contacts?.value).toEqual([{ email: 'a@b.co' }])

  component.setShow(true)
  flushSync()
  // reshown: chrome is back and the previously entered rows are restored
  expect(target.textContent).toContain('Contacts')
  expect(get(store).data.contacts).toEqual([{ email: 'a@b.co' }])

  // the AddMore must still be wired to the correct array path: adding appends a row
  const addbutton = Array.from(target.querySelectorAll('button')).find(b => b.textContent.includes('Add'))
  expect(addbutton).toBeDefined()
  addbutton.click()
  flushSync()
  expect(get(store).data.contacts).toHaveLength(2)

  // and removing deletes the right row
  const delbutton = Array.from(target.querySelectorAll('button.dialog-multiple-delete'))[1]
  expect(delbutton).toBeDefined()
  delbutton.click()
  flushSync()
  expect(get(store).data.contacts).toEqual([{ email: 'a@b.co' }])

  unmount(component)
  target.remove()
})
