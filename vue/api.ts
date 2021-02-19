import { mount, patch, track, trigger, watchMap } from "./index"
import { IComponent, VNode } from "./interface"

export let activeEffect: Function | null = null

export function reactive(value: any) {
  return new Proxy(value, {
    get(target, key, receiver) {
      track(target, key)
      return Reflect.get(target, key, receiver)
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

export function watch(
  sourceFn: Function,
  cb: Function,
  option = {
    lazy: false,
  }
) {
  function setWatchMap() {
    watchMap.set(sourceFn, {
      res: sourceFn(),
      cb,
    })
  }
  function checker() {
    const newRes = sourceFn()
    const oldRes = watchMap.get(sourceFn).res
    console.log(newRes, oldRes)
    if (oldRes !== newRes) {
      cb(newRes, oldRes)
      setWatchMap()
    }
  }
  if (!option.lazy) {
    setWatchMap()
  }
  effect(checker)
}


export function ref<T>(v: T): {
  value: T
} {
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

export function computed(getter: Function) {
  const res = ref(null)
  effect(() => (res.value = getter()))

  return res
}

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
