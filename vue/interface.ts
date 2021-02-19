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