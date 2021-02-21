import { computed, h, reactive, watch } from '../../vue/api'
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
// todo: 添加 defineComponent, 以支持类型提示
// todo: 支持 setup, 以及 props 传递
const child = {
  render() {
    return h(
      'div',
      null,
      [
        h(
          'div',
          {
            onClick: () => {
              state.count++
            },
          },
          `totalCount is ${totalCount.value}`
        ),
      ]
    )
  }
}
export const app = {
  render() {
    return h('div', null, [
      h(
        'div',
        {
          onClick: () => {
            state.count++
          },
        },
        `count: ${state.count}, count2: ${state.count2}`
      ),
      h(
        'div',
        {
          onClick: () => {
            state.nested.count++
          },
        },
        `nested count: ${state.nested.count}`
      ),
      h(child, null),
      h(
        'div',
        {
          onClick: () => {
            state.array.push(1)
          },
        },
        [
          h('div', null, '下面是数组类型: 点击添加'),
          ...state.array.map(item => {
            return h('div', null, `${item}`)
          })
        ]
      ),
    ])
  },
}
