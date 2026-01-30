<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  data: unknown
}>()

const formattedJson = computed(() => {
  try {
    return JSON.stringify(props.data, null, 2)
  } catch {
    return 'Invalid JSON'
  }
})
</script>

<template>
  <pre class="json-viewer"><code>{{ formattedJson }}</code></pre>
</template>

<style scoped>
.json-viewer {
  margin: 0;
  padding: 0;
  font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
  font-size: 0.8125rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  color: rgba(var(--v-theme-on-surface), 0.87);
}
</style>
