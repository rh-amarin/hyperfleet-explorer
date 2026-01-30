<script setup lang="ts">
import ResourceViewer from '@/components/viewer/ResourceViewer.vue'
import { useSelectionStore } from '@/stores/selection'
import { useConnectionStore } from '@/stores/connection'

const selectionStore = useSelectionStore()
const connectionStore = useConnectionStore()
</script>

<template>
  <div class="main-panel">
    <div v-if="!connectionStore.isConnected" class="empty-state">
      <v-icon icon="mdi-connection" size="64" color="grey-darken-1" />
      <div class="text-h6 mt-4 text-grey-darken-1">Not Connected</div>
      <div class="text-body-2 text-grey">Connect to a HyperFleet API to get started</div>
    </div>

    <div v-else-if="!selectionStore.hasSelection" class="empty-state">
      <v-icon icon="mdi-cursor-default-click" size="64" color="grey-darken-1" />
      <div class="text-h6 mt-4 text-grey-darken-1">No Resource Selected</div>
      <div class="text-body-2 text-grey">Select a cluster or nodepool from the list</div>
    </div>

    <ResourceViewer v-else />
  </div>
</template>

<style scoped>
.main-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
