import { defineComponent, h, } from "../../vue/api";
import { IRef } from "../../vue/interface";

// todo: 支持组件内部状态更新, 只 patch 组件 dom
export default defineComponent({
  props: {
    count: Number,
    totalCount: Object as unknown as IRef<Number>,
  },
  render(state, _ctx) {
    console.log(_ctx)
    
    console.log('render')
    
    return h(
      'div',
      null,
      [
        h(
          'div',
          {
            onClick: () => {
              // todo: 这里直接call 不好, 需要 emit
              state.count++
            },
          },
          `totalCount is ${state.totalCount.value}`
        ),
      ]
    )
  }
})