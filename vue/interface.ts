export interface stringObj {
  [key: string]: any
}
export interface VNode {
  tag: string,
  el?: HTMLElement
  props?: stringObj | null,
  children?: VNode[] | string
}

export interface IComponent {
  render: () => VNode,
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