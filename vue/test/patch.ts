import { mount, patch } from '..'
import { h } from '../api'

// fixme: 怎么测
const vnode = h(
  'div',
  {
    class: 'red',
  },
  [
    h(
      'span',
      {
        class: 'blue',
      },
      'hello'
    ),
    h(
      'span',
      {
        class: 'blue',
      },
      'world!'
    ),
  ]
)

mount(vnode, document.getElementById('app')!)

const vnode2 = h(
  'div',
  {
    class: 'red',
  },
  [
    h(
      'span',
      {
        class: 'blue',
      },
      'hello'
    ),
    h(
      'span',
      {
        class: 'blue',
      },
      ' world!'
    ),
    h(
      'div',
      {
        class: 'blue',
      },
      'cool'
    ),
    h('div', null, [h('span', null, 'cooler')]),
    h('div', null, [h('span', null, [h('span', null, 'coolest')])]),
  ]
)

patch(vnode, vnode2)
