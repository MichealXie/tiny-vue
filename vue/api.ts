import { mount, patch, track, trigger, watchMap } from "./index"
import { IComponent, IRef, VNode } from "./interface"

export let activeEffect: Function | null = null

export function reactive<T extends object>(value: T) {
  return new Proxy(value, {
    get(target, key, receiver) {
      let res = Reflect.get(target, key, receiver)
      if (typeof res === 'object' && res !== null) {
        res = reactive(res)
      }
      track(target, key)
      return res
    },
    set(target, key, value, receiver) {
      // fixme: set 的时候也应该触发 track?
      const oldValue = Reflect.get(target, key)
      Reflect.set(target, key, value, receiver)

      if (oldValue !== value) {
        trigger(target, key)
      }

      return value
    },
  })
}

export function effect(fn: Function): void {
  activeEffect = fn
  fn()
  activeEffect = null
}

export type WarchSource<T> = (() => T) | IRef<T>
export type WatchCallback<V> = (
  value: V,
  oldValue: V,
) => any

export function watch<T>(
  source: WarchSource<T>,
  cb: WatchCallback<T>,
  option = {
    lazy: false,
  }
) {
  function setWatchMap() {
    watchMap.set(source, {
      res: typeof source === 'function' ? source() : source,
      cb,
    })
  }
  function checker() {
    const newRes = typeof source === 'function' ? source() : source
    const oldRes = watchMap.get(source).res as T
    console.log(newRes, oldRes)
    if (oldRes !== newRes) {
      cb(newRes as T, oldRes)
      setWatchMap()
    }
  }
  if (!option.lazy) {
    setWatchMap()
  }
  effect(checker)
}


export function ref<T>(v: T): IRef<T> {
  let raw = v
  const res = {
    get value() {
      track(res, 'value')
      return raw
    },
    set value(newV) {
      if (newV === raw) return
      raw = newV
      trigger(res, 'value')
    },
  }
  return res
}

export function computed<T>(getter: () => T) {
  const res = ref<T>(getter())
  // todo: lazy
  effect(() => (res.value = getter()))

  return res
}

// todo: children 支持数组里字符串与 vnode 混用
export function h(tag: VNode['tag'], props: VNode["props"], children?: VNode["children"]): Omit<VNode, 'el'> {
  return {
    tag,
    props,
    children,
  }
}

export function mountApp(app: IComponent , container: HTMLElement) {
  let isMounted = false
  let oldVnode: VNode
  // NOTE: 目前全局更新的所有 effect 都来自于这个...
  // 有没有针对组件级别的 effect 呢?
  effect(() => {
    if (!isMounted) {
      oldVnode = app.render()
      mount(oldVnode, container)
      isMounted = true
    } else {
      const newVnode = app.render()
      patch(oldVnode, newVnode)
      oldVnode = newVnode
    }
  })
}
