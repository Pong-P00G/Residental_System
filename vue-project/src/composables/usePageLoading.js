import { onBeforeUnmount, onMounted, ref } from 'vue'


export function usePageLoading(delay = 420) {
  const loading = ref(delay > 0)
  let timer

  onMounted(() => {
    if (!loading.value) return
    timer = setTimeout(() => {
      loading.value = false
    }, delay)
  })

  onBeforeUnmount(() => clearTimeout(timer))

  return { loading }
}
