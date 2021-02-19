const targetMap: WeakMap<object, Map<any, Set<Function>>> = new WeakMap()
let activeEffect: Function | null = null

function track(target: object, key: string | symbol | number) {
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

function trigger(target: any, key: string | symbol | number) {
  targetMap.get(target)?.get(key)?.forEach(effect => {
    effect()
  })
}

function reactive(value: any) {
  return new Proxy(value, {
    get(target, key, receiver) {
      track(target, key)
      return target[key]
      // return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
      // fixme: set 的时候也应该触发 track?
      const oldValue = Reflect.get(target, key)
      Reflect.set(target, key, value, receiver)
      
      if (oldValue !== value) {
        trigger(target, key)
      }
      
      return value
    }
  })
}

function effect(fn: Function) {
  activeEffect = fn
  fn()
  activeEffect = null
}

function ref<T>(v: T): {
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
    }
  }
  return res
}

function computed(getter: Function) {
  const res = ref<any>(null)
  effect(() => res.value = getter())

  return res
}


const product = reactive({
  count: 2,
  price: 10,
})
const salePrice = ref(0)
const total = computed(() => {
  return product.count * salePrice.value
})
effect(() => {
  salePrice.value = product.price * 0.9
})

console.log(total.value)

product.count = 4

console.log(total.value)
console.log(salePrice.value)

// 新加的也会有效果
product.name = 'socks'
effect(() => {
  console.log(product.name)
})
product.name = 'socks version 2'