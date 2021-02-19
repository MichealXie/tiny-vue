import { activeEffect } from './api'
import { VNode } from './interface'
import { isIntegerKey } from './util'

// Q: 这里对于嵌套数据是怎么处理的?
// A: 因为是Map, key 都是对象, 不会重复, 方便的很
export const targetMap: ITargetMap = new WeakMap()
type IEffects = Set<Function>
type IDepsMap = Map<any, IEffects>
type ITargetMap = WeakMap<object, IDepsMap>
export const watchMap = new Map()

export function track(target: object, key: string | symbol | number) {
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  let deps = depsMap.get(key)
  if (!deps) {
    deps = new Set()
    depsMap.set(key, deps)
  }

  if (activeEffect) deps.add(activeEffect)
}

function checkArray(target: any, key: string | symbol | number, depsMap: IDepsMap) {
  const isArray = Array.isArray(target)
  // 数组的改动需要监听长度变化
  if (isArray && isIntegerKey(key)) {
    const lengthChangeEffects = targetMap.get(target)?.get('length')

    if (lengthChangeEffects) {
      lengthChangeEffects.forEach((effectToAdd) => {
        let deps = depsMap.get(key)
        if (!deps) {
          deps = new Set()
          depsMap.set(key, deps)
        }
        deps.add(effectToAdd)
      })
    }
  }
}
export function trigger(target: any, key: string | symbol | number) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  checkArray(target, key, depsMap)

  depsMap.get(key)?.forEach((effect) => {
    effect()
  })
}

export function mount(vnode: VNode, container: HTMLElement) {
  const el = document.createElement(vnode.tag)
  vnode.el = el
  if (vnode.props && typeof vnode.props === 'object') {
    for (const [key, value] of Object.entries(vnode.props)) {
      if (key.startsWith('on')) {
        el.addEventListener(key.slice(2).toLowerCase(), value)
      } else {
        el.setAttribute(key, value)
      }
    }
  }

  if (vnode.children) {
    // 这里只假设 vnode 只可能是字符串或者数组
    if (typeof vnode.children === 'string') {
      el.textContent = vnode.children
    } else {
      for (const child of vnode.children) {
        mount(child, el)
      }
    }
  }

  container.appendChild(el)
}

export function patch(n1: VNode, n2: VNode) {
  if (!n1.el) {
    throw new Error(`!n1.el`)
  }
  n2.el = n1.el
  if (n1.tag !== n2.tag) {
    mount(n2, n1.el)
    return
  }

  // props
  const oldProps = n1.props || {}
  const newProps = n2.props || {}
  for (const key in newProps) {
    const oldValue = oldProps[key]
    const newValue = newProps[key]
    if (oldValue !== newValue) {
      n1.el.setAttribute(key, newValue)
    }
  }
  for (const key in oldProps) {
    if (!(key in newProps)) {
      n1.el.removeAttribute(key)
    }
  }

  // children
  const oldChildren = n1.children || []
  const newChildren = n2.children || []
  // string
  if (typeof oldChildren === 'string') {
    if (typeof newChildren === 'string') {
      if (oldChildren !== newChildren) {
        n1.el.textContent = newChildren
      }
    } else if (Array.isArray(newChildren)) {
      n1.el.textContent = ''
      newChildren.forEach((child) => {
        mount(child, n1.el!)
      })
    }
    return
  } else if (Array.isArray(oldChildren)) {
    if (typeof newChildren === 'string') {
      n1.el.textContent = newChildren
      n1.el.innerHTML = ''
    } else {
      // array
      const commonLength = Math.min(oldChildren.length, newChildren.length)
      for (let index = 0; index < commonLength; index++) {
        const oldChild = oldChildren[index]
        const newChild = newChildren[index]
        patch(oldChild, newChild)
      }

      // 删除节点
      if (oldChildren.length > newChildren.length) {
        console.log(oldChildren.length)
        console.log(commonLength)
        for (let index = commonLength; index < oldChildren.length; index++) {
          console.log(index)
          n1.el.removeChild(n1.el.children[index])
        }
      }
      // 新增节点
      if (oldChildren.length < newChildren.length) {
        newChildren.slice(commonLength).forEach((child) => {
          mount(child, n1.el!)
        })
      }
    }
  }
}
