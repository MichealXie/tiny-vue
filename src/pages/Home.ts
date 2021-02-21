import { targetMap } from '../../vue'
import { computed, defineComponent, h, reactive, watch } from '../../vue/api'
import child from '../components/child'

// todo: 支持 setup
export const app = defineComponent({
  setup() {
    const state = reactive({
      count: 0,
      count2: 0,
      nested: {
        count: 0,
      },
      array: [1,2]
    })
    const totalCount = computed(() => {
      return state.count + state.count2 + state.nested.count
    })

    watch(
      () => {
        return state.count
      },
      (newV, oldV) => {
        state.count2 += 1
      }
    )
    return {
      state,
      totalCount,
    }
  },
  render(props, _ctx) {
    console.log(_ctx)
    
    console.log('render')
    
    return h('div', null, [
      h(
        'div',
        {
          onClick: () => {
            _ctx.state.count++
          },
        },
        `count: ${_ctx.state.count}, count2: ${_ctx.state.count2}`
      ),
      h(
        'div',
        {
          onClick: () => {
            _ctx.state.nested.count++
          },
        },
        `nested count: ${_ctx.state.nested.count}`
      ),
      h(child, {
        props: {
          count: _ctx.state.count,
          totalCount: _ctx.totalCount,
        }
      }),
      h(
        'div',
        {
          onClick: () => {
            _ctx.state.array.push(1)
          },
        },
        [
          h('div', null, '下面是数组类型: 点击添加'),
          ..._ctx.state.array.map((item: any) => {
            return h('div', null, `${item}`)
          })
        ]
      ),
    ])
  },
})
