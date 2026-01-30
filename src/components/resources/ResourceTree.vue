<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import ClusterItem from './ClusterItem.vue'
import { useResourcesStore } from '@/stores/resources'
import { useConnectionStore } from '@/stores/connection'
import { useApi } from '@/composables/useApi'

const resourcesStore = useResourcesStore()
const connectionStore = useConnectionStore()
const api = useApi()

let pollInterval: ReturnType<typeof setInterval> | null = null

async function fetchClusters() {
  if (!connectionStore.isConnected) return

  resourcesStore.setLoadingClusters(true)
  try {
    const clusters = await api.getClusters()
    resourcesStore.setClusters(clusters)
  } catch (e) {
    console.error('Failed to fetch clusters:', e)
  } finally {
    resourcesStore.setLoadingClusters(false)
  }
}

function startPolling() {
  stopPolling()
  fetchClusters()
  pollInterval = setInterval(fetchClusters, 10000)
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}

watch(
  () => connectionStore.isConnected,
  (connected) => {
    if (connected) {
      startPolling()
    } else {
      stopPolling()
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (connectionStore.isConnected) {
    startPolling()
  }
})

onUnmounted(() => {
  stopPolling()
})
</script>

<template>
  <div class="resource-tree">
    <v-progress-linear
      v-if="resourcesStore.loadingClusters && resourcesStore.clusters.length === 0"
      indeterminate
      color="primary"
    />

    <v-list v-else density="compact" nav class="pa-0">
      <ClusterItem
        v-for="cluster in resourcesStore.clusters"
        :key="cluster.id"
        :cluster="cluster"
      />

      <v-list-item v-if="resourcesStore.clusters.length === 0" class="text-grey">
        <v-list-item-title>No clusters found</v-list-item-title>
      </v-list-item>
    </v-list>
  </div>
</template>

<style scoped>
.resource-tree {
  overflow-y: auto;
  flex: 1;
}
</style>
