<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted, ref } from 'vue'
import JsonDiffHighlight from './JsonDiffHighlight.vue'
import { useSelectionStore } from '@/stores/selection'
import { useConnectionStore } from '@/stores/connection'
import { useApi } from '@/composables/useApi'

const selectionStore = useSelectionStore()
const connectionStore = useConnectionStore()
const api = useApi()

const isLoading = ref(false)
const error = ref<string | null>(null)

let pollInterval: ReturnType<typeof setInterval> | null = null

const resourceTitle = computed(() => {
  if (selectionStore.selectedType === 'cluster') {
    return `Cluster: ${selectionStore.selectedClusterId}`
  }
  return `NodePool: ${selectionStore.selectedNodePoolId}`
})

async function fetchData() {
  if (!connectionStore.isConnected || !selectionStore.hasSelection) return

  isLoading.value = true
  error.value = null

  try {
    if (selectionStore.selectedType === 'cluster' && selectionStore.selectedClusterId) {
      const [resource, statuses] = await Promise.all([
        api.getCluster(selectionStore.selectedClusterId),
        api.getClusterStatuses(selectionStore.selectedClusterId),
      ])
      selectionStore.updateResourceData(resource)
      selectionStore.updateStatuses(statuses)
    } else if (
      selectionStore.selectedType === 'nodepool' &&
      selectionStore.selectedClusterId &&
      selectionStore.selectedNodePoolId
    ) {
      const [resource, statuses] = await Promise.all([
        api.getNodePool(selectionStore.selectedClusterId, selectionStore.selectedNodePoolId),
        api.getNodePoolStatuses(
          selectionStore.selectedClusterId,
          selectionStore.selectedNodePoolId
        ),
      ])
      selectionStore.updateResourceData(resource)
      selectionStore.updateStatuses(statuses)
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to fetch data'
  } finally {
    isLoading.value = false
  }
}

function startPolling() {
  stopPolling()
  fetchData()
  pollInterval = setInterval(fetchData, connectionStore.pollingInterval * 1000)
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}

watch(
  () => connectionStore.pollingInterval,
  () => {
    if (selectionStore.hasSelection) {
      startPolling()
    }
  }
)

watch(
  [() => selectionStore.selectedClusterId, () => selectionStore.selectedNodePoolId],
  () => {
    if (selectionStore.hasSelection) {
      startPolling()
    } else {
      stopPolling()
    }
  },
  { immediate: true }
)

watch(
  () => connectionStore.isConnected,
  (connected) => {
    if (!connected) {
      stopPolling()
    }
  }
)

onMounted(() => {
  if (selectionStore.hasSelection && connectionStore.isConnected) {
    startPolling()
  }
})

onUnmounted(() => {
  stopPolling()
})
</script>

<template>
  <div class="resource-viewer">
    <v-toolbar density="compact" color="surface">
      <v-toolbar-title class="text-body-1">{{ resourceTitle }}</v-toolbar-title>
      <v-spacer />
      <v-btn icon size="small" @click="fetchData" :loading="isLoading">
        <v-icon icon="mdi-refresh" />
      </v-btn>
    </v-toolbar>

    <v-alert v-if="error" type="error" variant="tonal" class="ma-4">
      {{ error }}
    </v-alert>

    <div class="viewer-content">
      <div class="viewer-column">
        <div class="column-header">
          <v-icon icon="mdi-code-json" size="small" class="mr-2" />
          Resource
        </div>
        <div class="column-content">
          <JsonDiffHighlight
            v-if="selectionStore.currentResourceData"
            :current="selectionStore.currentResourceData"
            :previous="selectionStore.previousResourceData"
          />
          <div v-else class="text-center text-grey pa-4">Loading...</div>
        </div>
      </div>

      <v-divider vertical />

      <div class="viewer-column">
        <div class="column-header">
          <v-icon icon="mdi-list-status" size="small" class="mr-2" />
          Adapter Statuses
        </div>
        <div class="column-content">
          <JsonDiffHighlight
            v-if="selectionStore.currentStatuses.length > 0"
            :current="selectionStore.currentStatuses"
            :previous="selectionStore.previousStatuses"
          />
          <div v-else-if="selectionStore.currentResourceData" class="text-center text-grey pa-4">
            No adapter statuses
          </div>
          <div v-else class="text-center text-grey pa-4">Loading...</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.resource-viewer {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.viewer-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.viewer-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.column-header {
  padding: 8px 16px;
  background: rgba(var(--v-theme-surface-variant), 0.3);
  font-weight: 500;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.column-content {
  flex: 1;
  overflow: auto;
  padding: 16px;
}
</style>
