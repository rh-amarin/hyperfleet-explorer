import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const POLLING_INTERVALS = [1, 2, 5, 10, 20, 60] as const
export type PollingInterval = typeof POLLING_INTERVALS[number]

export const useConnectionStore = defineStore('connection', () => {
  const baseUrl = ref('http://localhost:5173')
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const connectionError = ref<string | null>(null)
  const pollingInterval = ref<PollingInterval>(5)

  const apiBaseUrl = computed(() => {
    let url = baseUrl.value.trim()
    if (url.endsWith('/')) {
      url = url.slice(0, -1)
    }
    return url
  })

  function connect() {
    isConnected.value = true
    isConnecting.value = false
    connectionError.value = null
  }

  function disconnect() {
    isConnected.value = false
    connectionError.value = null
  }

  function setError(error: string) {
    connectionError.value = error
    isConnected.value = false
    isConnecting.value = false
  }

  function setPollingInterval(interval: PollingInterval) {
    pollingInterval.value = interval
  }

  return {
    baseUrl,
    isConnected,
    isConnecting,
    connectionError,
    pollingInterval,
    apiBaseUrl,
    connect,
    disconnect,
    setError,
    setPollingInterval,
  }
})
