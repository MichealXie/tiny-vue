import { computed, h, reactive, watch } from '../../vue/api'
const state = reactive({
  count: 0,
  count2: 0,
  nested: {
    count: 0,
  },
})
const countPlusOne = computed(() => {
  return state.count + 1
})

watch(
  () => {
    return state.count
  },
  // fixme: types
  (newV: any, oldV: any) => {
    state.count2 += 1
    console.log(`watch, value form ${oldV} changed to ${newV}`)
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
    ])
  },
}
