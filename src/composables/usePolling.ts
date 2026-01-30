import { ref, watch, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import { useConnectionStore } from '@/stores/connection'

export function usePolling<T>(
  fetchFn: () => Promise<T>,
  options: {
    immediate?: boolean
    useConfiguredInterval?: boolean
    fixedIntervalSeconds?: number
  } = {}
) {
  const connectionStore = useConnectionStore()
  const data = ref<T | null>(null) as Ref<T | null>
  const previousData = ref<T | null>(null) as Ref<T | null>
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  let intervalId: ReturnType<typeof setInterval> | null = null

  async function poll() {
    if (!connectionStore.isConnected) {
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const result = await fetchFn()
      previousData.value = data.value
      data.value = result
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      isLoading.value = false
    }
  }

  function start() {
    stop()

    const intervalSeconds = options.useConfiguredInterval
      ? connectionStore.pollingInterval
      : options.fixedIntervalSeconds || 10

    intervalId = setInterval(poll, intervalSeconds * 1000)

    if (options.immediate !== false) {
      poll()
    }
  }

  function stop() {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  function reset() {
    data.value = null
    previousData.value = null
    error.value = null
  }

  if (options.useConfiguredInterval) {
    watch(
      () => connectionStore.pollingInterval,
      () => {
        if (intervalId !== null) {
          start()
        }
      }
    )
  }

  watch(
    () => connectionStore.isConnected,
    (connected) => {
      if (!connected) {
        stop()
        reset()
      }
    }
  )

  onUnmounted(() => {
    stop()
  })

  return {
    data,
    previousData,
    isLoading,
    error,
    poll,
    start,
    stop,
    reset,
  }
}
