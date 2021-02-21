export interface IProps {
  // todo: 支持 class
  class?: string[] | string,
  props?: {
    [key: string]: any
  }
  [key: string]: any
}
export interface VNode {
  type: string | VNode,
  el?: HTMLElement
  // todo: 改名
  props?: IProps | null,
  children?: VNode[] | string
}

export interface IRef<T> {
  value: T
}

export interface IEffectOption {
  lazy?: boolean
  scheduler?: (fn: IEffect) => any,
}

export interface IEffect<T = any> {
  (): T
  raw: () => T
  _isEffect: true
  option?: IEffectOption
}
export interface IDefineComponentArg {
  props?: {
    [key: string]: any
  },
  render: (state?: any) => VNode
  setup?: (props?: IProps["props"]) => Object,
  name?: string,
  // 因为直接用的 render function, 这个参数就不需要了
  // 假如需要, name 来 map components 的 key, 再换出 VNode
  // components: {
  //   [key: string]: IDefineComponentArg
  // },
}
