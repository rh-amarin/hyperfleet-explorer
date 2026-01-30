import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ResourceType, Cluster, NodePool, AdapterStatus } from '@/types/hyperfleet'

export const useSelectionStore = defineStore('selection', () => {
  const selectedType = ref<ResourceType | null>(null)
  const selectedClusterId = ref<string | null>(null)
  const selectedNodePoolId = ref<string | null>(null)

  const currentResourceData = ref<Cluster | NodePool | null>(null)
  const previousResourceData = ref<Cluster | NodePool | null>(null)

  const currentStatuses = ref<AdapterStatus[]>([])
  const previousStatuses = ref<AdapterStatus[]>([])

  const hasSelection = computed(() => {
    return selectedType.value !== null
  })

  function selectCluster(clusterId: string) {
    selectedType.value = 'cluster'
    selectedClusterId.value = clusterId
    selectedNodePoolId.value = null
    previousResourceData.value = null
    currentResourceData.value = null
    previousStatuses.value = []
    currentStatuses.value = []
  }

  function selectNodePool(clusterId: string, nodePoolId: string) {
    selectedType.value = 'nodepool'
    selectedClusterId.value = clusterId
    selectedNodePoolId.value = nodePoolId
    previousResourceData.value = null
    currentResourceData.value = null
    previousStatuses.value = []
    currentStatuses.value = []
  }

  function clearSelection() {
    selectedType.value = null
    selectedClusterId.value = null
    selectedNodePoolId.value = null
    previousResourceData.value = null
    currentResourceData.value = null
    previousStatuses.value = []
    currentStatuses.value = []
  }

  function updateResourceData(data: Cluster | NodePool) {
    previousResourceData.value = currentResourceData.value
    currentResourceData.value = data
  }

  function updateStatuses(statuses: AdapterStatus[]) {
    previousStatuses.value = currentStatuses.value
    currentStatuses.value = statuses
  }

  return {
    selectedType,
    selectedClusterId,
    selectedNodePoolId,
    currentResourceData,
    previousResourceData,
    currentStatuses,
    previousStatuses,
    hasSelection,
    selectCluster,
    selectNodePool,
    clearSelection,
    updateResourceData,
    updateStatuses,
  }
})
