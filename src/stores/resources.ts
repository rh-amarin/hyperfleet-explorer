import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Cluster, NodePool } from '@/types/hyperfleet'

export const useResourcesStore = defineStore('resources', () => {
  const clusters = ref<Cluster[]>([])
  const nodePoolsByCluster = ref<Map<string, NodePool[]>>(new Map())
  const loadingClusters = ref(false)
  const loadingNodePools = ref<Set<string>>(new Set())
  const expandedClusters = ref<Set<string>>(new Set())

  function setClusters(newClusters: Cluster[]) {
    clusters.value = newClusters
  }

  function setNodePools(clusterId: string, nodePools: NodePool[]) {
    nodePoolsByCluster.value.set(clusterId, nodePools)
  }

  function getNodePools(clusterId: string): NodePool[] {
    return nodePoolsByCluster.value.get(clusterId) || []
  }

  function setLoadingClusters(loading: boolean) {
    loadingClusters.value = loading
  }

  function setLoadingNodePools(clusterId: string, loading: boolean) {
    if (loading) {
      loadingNodePools.value.add(clusterId)
    } else {
      loadingNodePools.value.delete(clusterId)
    }
  }

  function isLoadingNodePools(clusterId: string): boolean {
    return loadingNodePools.value.has(clusterId)
  }

  function toggleClusterExpanded(clusterId: string) {
    if (expandedClusters.value.has(clusterId)) {
      expandedClusters.value.delete(clusterId)
    } else {
      expandedClusters.value.add(clusterId)
    }
  }

  function isClusterExpanded(clusterId: string): boolean {
    return expandedClusters.value.has(clusterId)
  }

  function clear() {
    clusters.value = []
    nodePoolsByCluster.value.clear()
    expandedClusters.value.clear()
    loadingClusters.value = false
    loadingNodePools.value.clear()
  }

  return {
    clusters,
    nodePoolsByCluster,
    loadingClusters,
    loadingNodePools,
    expandedClusters,
    setClusters,
    setNodePools,
    getNodePools,
    setLoadingClusters,
    setLoadingNodePools,
    isLoadingNodePools,
    toggleClusterExpanded,
    isClusterExpanded,
    clear,
  }
})
