import { computed, h, reactive, watch } from '../../vue/api'
const state = reactive({
  count: 0,
  count2: 0,
  nested: {
    count: 0,
  },
  array: [1,2]
})
const countPlusOne = computed(() => {
  return state.count + state.count2
})

watch(
  () => {
    return state.count
  },
  (newV, oldV) => {
    state.count2 += 1
  }
)
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
            state.count++
          },
        },
        `plusOne is ${countPlusOne.value}`
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
