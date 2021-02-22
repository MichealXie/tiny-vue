import { activeEffect } from './api'
import { IComponent, IEffect, VNode } from './interface'
import { isIntegerKey } from './util'

// Q: 这里对于嵌套数据是怎么处理的?
// A: 因为是Map, key 都是对象, 不会重复, 方便的很
export const targetMap: ITargetMap = new WeakMap()
type IEffects = Set<IEffect>
type IDepsMap = Map<any, IEffects>
type ITargetMap = WeakMap<object, IDepsMap>
export const watchMap = new Map()
const schedulerQueue: Set<Function> = new Set()

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
    if (effect.option?.scheduler) {
      schedulerQueue.add(effect.option.scheduler)
    } else {
      schedulerQueue.add(effect)
    }
  })

  // fixme: 应该有个更好的时机触发, 这里硬生生的写不好
  Promise.resolve().then(() => {
    schedulerQueue.forEach((job) => {
      job()
      schedulerQueue.delete(job)
    })
  })
}


// todo: life cycle function
// todo: 声明 currentInstace, 来附加 life cycle function
export function mount(vnode: VNode, container: HTMLElement) {
  if (typeof vnode.type === 'string') {
    patch(null, vnode, container)
  }
  let el: HTMLElement
  if (typeof vnode.type === 'string') {
    el = document.createElement(vnode.type)
  } else {
    el = mount(vnode.type, container).el!
  }
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

  return vnode
}

export function patch(n1: VNode, n2: VNode, container: HTMLElement, parentComponent: IComponent) {
  if (typeof n1.type === 'string' && typeof n2.type === 'string') {
    if (n1.type !== n2.type) {
      mount(n2, n2.el)
      return
    }
  } else {
    patch(n1.type as VNode, n2.type as VNode)
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
        for (let index = commonLength; index < oldChildren.length; index++) {
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

export function createEffect<T = any>(fn: () => T, option: IEffect<T>['option']): IEffect<T> {
  const effect = (function reactiveEffect() {
    return fn()
  } as unknown) as IEffect<T>

  effect.raw = fn
  effect.option = option
  effect._isEffect = true

  return effect
}
