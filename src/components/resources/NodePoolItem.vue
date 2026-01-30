<script setup lang="ts">
import { computed } from 'vue'
import { useSelectionStore } from '@/stores/selection'
import type { NodePool } from '@/types/hyperfleet'

const props = defineProps<{
  nodePool: NodePool
  clusterId: string
}>()

const selectionStore = useSelectionStore()

const isSelected = computed(() => {
  return (
    selectionStore.selectedType === 'nodepool' &&
    selectionStore.selectedClusterId === props.clusterId &&
    selectionStore.selectedNodePoolId === props.nodePool.id
  )
})

function selectNodePool() {
  selectionStore.selectNodePool(props.clusterId, props.nodePool.id)
}
</script>

<template>
  <v-list-item
    :active="isSelected"
    class="pl-12"
    @click="selectNodePool"
  >
    <template #prepend>
      <v-icon icon="mdi-circle-outline" size="small" color="secondary" />
    </template>
    <v-list-item-title>{{ nodePool.name }}</v-list-item-title>
    <v-list-item-subtitle class="text-truncate">
      {{ nodePool.id }}
    </v-list-item-subtitle>
  </v-list-item>
</template>
