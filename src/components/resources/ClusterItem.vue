<script setup lang="ts">
import { computed } from 'vue'
import NodePoolItem from './NodePoolItem.vue'
import { useResourcesStore } from '@/stores/resources'
import { useSelectionStore } from '@/stores/selection'
import { useApi } from '@/composables/useApi'
import type { Cluster } from '@/types/hyperfleet'

const props = defineProps<{
  cluster: Cluster
}>()

const resourcesStore = useResourcesStore()
const selectionStore = useSelectionStore()
const api = useApi()

const isExpanded = computed(() => resourcesStore.isClusterExpanded(props.cluster.id))
const isLoading = computed(() => resourcesStore.isLoadingNodePools(props.cluster.id))
const nodePools = computed(() => resourcesStore.getNodePools(props.cluster.id))

const isSelected = computed(() => {
  return (
    selectionStore.selectedType === 'cluster' &&
    selectionStore.selectedClusterId === props.cluster.id
  )
})

async function toggleExpand() {
  resourcesStore.toggleClusterExpanded(props.cluster.id)

  if (resourcesStore.isClusterExpanded(props.cluster.id) && nodePools.value.length === 0) {
    await fetchNodePools()
  }
}

async function fetchNodePools() {
  resourcesStore.setLoadingNodePools(props.cluster.id, true)
  try {
    const pools = await api.getNodePools(props.cluster.id)
    resourcesStore.setNodePools(props.cluster.id, pools)
  } catch (e) {
    console.error('Failed to fetch nodepools:', e)
  } finally {
    resourcesStore.setLoadingNodePools(props.cluster.id, false)
  }
}

function selectCluster() {
  selectionStore.selectCluster(props.cluster.id)
}
</script>

<template>
  <v-list-group :value="cluster.id">
    <template #activator="{ props: activatorProps }">
      <v-list-item
        v-bind="activatorProps"
        :active="isSelected"
        @click.stop="selectCluster"
      >
        <template #prepend>
          <v-icon
            :icon="isExpanded ? 'mdi-chevron-down' : 'mdi-chevron-right'"
            size="small"
            @click.stop="toggleExpand"
          />
          <v-icon icon="mdi-server-network" color="primary" class="ml-1" />
        </template>
        <v-list-item-title>{{ cluster.name }}</v-list-item-title>
        <v-list-item-subtitle class="text-truncate">
          {{ cluster.id }}
        </v-list-item-subtitle>
      </v-list-item>
    </template>

    <template v-if="isExpanded">
      <v-progress-linear v-if="isLoading" indeterminate color="primary" height="2" />

      <NodePoolItem
        v-for="nodePool in nodePools"
        :key="nodePool.id"
        :node-pool="nodePool"
        :cluster-id="cluster.id"
      />

      <v-list-item v-if="!isLoading && nodePools.length === 0" class="text-grey pl-12">
        <v-list-item-title class="text-caption">No nodepools</v-list-item-title>
      </v-list-item>
    </template>
  </v-list-group>
</template>
