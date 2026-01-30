<script setup lang="ts">
import { ref } from 'vue'
import { useConnectionStore, POLLING_INTERVALS, type PollingInterval } from '@/stores/connection'
import { useResourcesStore } from '@/stores/resources'
import { useSelectionStore } from '@/stores/selection'
import { useApi } from '@/composables/useApi'

const connectionStore = useConnectionStore()
const resourcesStore = useResourcesStore()
const selectionStore = useSelectionStore()
const api = useApi()

const isConnecting = ref(false)
const connectionError = ref<string | null>(null)

const pollingOptions = POLLING_INTERVALS.map((interval) => ({
  title: `${interval} second${interval > 1 ? 's' : ''}`,
  value: interval,
}))

async function handleConnect() {
  if (connectionStore.isConnected) {
    connectionStore.disconnect()
    resourcesStore.clear()
    selectionStore.clearSelection()
    return
  }

  isConnecting.value = true
  connectionError.value = null

  try {
    const success = await api.testConnection()
    if (success) {
      connectionStore.connect()
    } else {
      connectionError.value = 'Failed to connect to API'
    }
  } catch (e) {
    connectionError.value = e instanceof Error ? e.message : 'Connection failed'
  } finally {
    isConnecting.value = false
  }
}

function handlePollingChange(interval: PollingInterval) {
  connectionStore.setPollingInterval(interval)
}
</script>

<template>
  <div class="configuration-panel px-4">
    <div class="text-subtitle-2 mb-2" style="color: rgba(var(--v-theme-on-surface), 0.6)">
      CONNECTION
    </div>

    <v-text-field
      v-model="connectionStore.baseUrl"
      label="API Base URL"
      placeholder="http://localhost:5173"
      :disabled="connectionStore.isConnected"
      hide-details="auto"
      class="mb-3"
    />

    <div class="d-flex align-center gap-2 mb-3">
      <v-btn
        :color="connectionStore.isConnected ? 'error' : 'primary'"
        :loading="isConnecting"
        @click="handleConnect"
        block
      >
        <v-icon :icon="connectionStore.isConnected ? 'mdi-connection' : 'mdi-power-plug'" start />
        {{ connectionStore.isConnected ? 'Disconnect' : 'Connect' }}
      </v-btn>
    </div>

    <v-alert
      v-if="connectionError"
      type="error"
      variant="tonal"
      density="compact"
      class="mb-3"
      closable
      @click:close="connectionError = null"
    >
      {{ connectionError }}
    </v-alert>

    <v-chip
      v-if="connectionStore.isConnected"
      color="success"
      size="small"
      prepend-icon="mdi-check-circle"
      class="mb-3"
    >
      Connected
    </v-chip>

    <div class="text-subtitle-2 mb-2 mt-2" style="color: rgba(var(--v-theme-on-surface), 0.6)">
      POLLING
    </div>

    <v-select
      :model-value="connectionStore.pollingInterval"
      :items="pollingOptions"
      label="Refresh Interval"
      :disabled="!connectionStore.isConnected"
      hide-details
      @update:model-value="handlePollingChange"
    />
  </div>
</template>

<style scoped>
.configuration-panel {
  padding-bottom: 8px;
}
</style>
