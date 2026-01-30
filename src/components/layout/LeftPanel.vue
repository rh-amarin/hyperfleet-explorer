<script setup lang="ts">
import ConfigurationPanel from '@/components/config/ConfigurationPanel.vue'
import ResourceTree from '@/components/resources/ResourceTree.vue'
import AdapterStatusForm from '@/components/status/AdapterStatusForm.vue'
import { useConnectionStore } from '@/stores/connection'

const connectionStore = useConnectionStore()
</script>

<template>
  <div class="left-panel-container">
    <div class="panel-header">
      <v-toolbar color="primary" density="compact">
        <v-toolbar-title>HyperFleet Explorer</v-toolbar-title>
      </v-toolbar>
    </div>

    <div class="panel-content">
      <ConfigurationPanel />

      <v-divider class="my-3" />

      <div v-if="connectionStore.isConnected" class="resource-section">
        <div class="section-title text-subtitle-2 px-4 mb-2">Resources</div>
        <ResourceTree />
      </div>

      <div v-else class="disconnected-message pa-4">
        <v-alert type="info" variant="tonal" density="compact">
          Connect to a HyperFleet API to browse resources
        </v-alert>
      </div>
    </div>

    <div class="panel-footer">
      <v-divider />
      <AdapterStatusForm />
    </div>
  </div>
</template>

<style scoped>
.left-panel-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.panel-header {
  flex-shrink: 0;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding-top: 16px;
}

.resource-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.section-title {
  color: rgba(var(--v-theme-on-surface), 0.6);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.panel-footer {
  flex-shrink: 0;
}
</style>
