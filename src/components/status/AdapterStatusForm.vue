<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSelectionStore } from '@/stores/selection'
import { useConnectionStore } from '@/stores/connection'
import { useApi } from '@/composables/useApi'
import type { ResourceType, AdapterStatusPayload, Condition } from '@/types/hyperfleet'

const selectionStore = useSelectionStore()
const connectionStore = useConnectionStore()
const api = useApi()

const resourceType = ref<ResourceType>('cluster')
const adapterName = ref('')
const observedGeneration = ref<number | null>(null)
const availableStatus = ref<'True' | 'False' | 'Unknown'>('True')
const isSubmitting = ref(false)
const successMessage = ref<string | null>(null)
const errorMessage = ref<string | null>(null)

const resourceTypes = [
  { title: 'Cluster', value: 'cluster' as ResourceType },
  { title: 'NodePool', value: 'nodepool' as ResourceType },
]

const availableOptions = [
  { title: 'True', value: 'True' as const },
  { title: 'False', value: 'False' as const },
  { title: 'Unknown', value: 'Unknown' as const },
]

const canSubmit = computed(() => {
  if (!connectionStore.isConnected) return false
  if (!adapterName.value.trim()) return false

  if (resourceType.value === 'cluster') {
    return !!selectionStore.selectedClusterId
  } else {
    return !!selectionStore.selectedClusterId && !!selectionStore.selectedNodePoolId
  }
})

const selectedResourceLabel = computed(() => {
  if (resourceType.value === 'cluster') {
    return selectionStore.selectedClusterId
      ? `Cluster: ${selectionStore.selectedClusterId}`
      : 'No cluster selected'
  } else {
    return selectionStore.selectedNodePoolId
      ? `NodePool: ${selectionStore.selectedNodePoolId}`
      : 'No nodepool selected'
  }
})

function getReasonAndMessage(status: 'True' | 'False' | 'Unknown', type: string): { reason: string; message: string } {
  if (status === 'Unknown') {
    return { reason: 'Unknown', message: `${type} status is unknown` }
  }
  const isTrue = status === 'True'
  switch (type) {
    case 'Available':
      return {
        reason: isTrue ? 'Available' : 'Unavailable',
        message: isTrue ? 'Resource is available' : 'Resource is not available',
      }
    case 'Applied':
      return {
        reason: isTrue ? 'Applied' : 'NotApplied',
        message: isTrue ? 'Configuration applied' : 'Configuration not applied',
      }
    case 'Health':
      return {
        reason: isTrue ? 'Healthy' : 'Unhealthy',
        message: isTrue ? 'Resource is healthy' : 'Resource is not healthy',
      }
    default:
      return { reason: status, message: '' }
  }
}

function createConditions(status: 'True' | 'False' | 'Unknown'): Condition[] {
  const now = new Date().toISOString()
  const types = ['Available', 'Applied', 'Health']
  return types.map((type) => {
    const { reason, message } = getReasonAndMessage(status, type)
    return {
      type,
      status,
      reason,
      message,
      observed_time: now,
    }
  })
}

async function handleSubmit() {
  if (!canSubmit.value) return

  isSubmitting.value = true
  successMessage.value = null
  errorMessage.value = null

  const payload: AdapterStatusPayload = {
    adapter: adapterName.value.trim(),
    conditions: createConditions(availableStatus.value),
  }

  if (observedGeneration.value !== null) {
    payload.observed_generation = observedGeneration.value
  }

  try {
    if (resourceType.value === 'cluster' && selectionStore.selectedClusterId) {
      await api.postClusterStatus(selectionStore.selectedClusterId, payload)
      // Refresh statuses to trigger highlighting
      const statuses = await api.getClusterStatuses(selectionStore.selectedClusterId)
      selectionStore.updateStatuses(statuses)
      successMessage.value = 'Cluster status posted successfully'
    } else if (
      resourceType.value === 'nodepool' &&
      selectionStore.selectedClusterId &&
      selectionStore.selectedNodePoolId
    ) {
      await api.postNodePoolStatus(
        selectionStore.selectedClusterId,
        selectionStore.selectedNodePoolId,
        payload
      )
      // Refresh statuses to trigger highlighting
      const statuses = await api.getNodePoolStatuses(
        selectionStore.selectedClusterId,
        selectionStore.selectedNodePoolId
      )
      selectionStore.updateStatuses(statuses)
      successMessage.value = 'NodePool status posted successfully'
    }
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : 'Failed to post status'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="adapter-status-form pa-4">
    <div class="text-subtitle-2 mb-3" style="color: rgba(var(--v-theme-on-surface), 0.6)">
      POST ADAPTER STATUS
    </div>

    <v-select
      v-model="resourceType"
      :items="resourceTypes"
      label="Resource Type"
      :disabled="!connectionStore.isConnected"
      class="mb-3"
      hide-details
    />

    <v-text-field
      v-model="adapterName"
      label="Adapter Name"
      placeholder="e.g., my-adapter"
      :disabled="!connectionStore.isConnected"
      class="mb-3"
      hide-details
    />

    <v-text-field
      v-model.number="observedGeneration"
      label="Observed Generation (optional)"
      type="number"
      :disabled="!connectionStore.isConnected"
      class="mb-3"
      hide-details
    />

    <v-select
      v-model="availableStatus"
      :items="availableOptions"
      label="Available Status"
      :disabled="!connectionStore.isConnected"
      class="mb-3"
      hide-details
    />

    <div class="text-caption text-grey mb-3">
      {{ selectedResourceLabel }}
    </div>

    <v-btn
      color="primary"
      :disabled="!canSubmit"
      :loading="isSubmitting"
      block
      @click="handleSubmit"
    >
      <v-icon icon="mdi-send" start />
      Post Status
    </v-btn>

    <v-alert
      v-if="successMessage"
      type="success"
      variant="tonal"
      density="compact"
      class="mt-3"
      closable
      @click:close="successMessage = null"
    >
      {{ successMessage }}
    </v-alert>

    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      density="compact"
      class="mt-3"
      closable
      @click:close="errorMessage = null"
    >
      {{ errorMessage }}
    </v-alert>
  </div>
</template>

<style scoped>
.adapter-status-form {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
