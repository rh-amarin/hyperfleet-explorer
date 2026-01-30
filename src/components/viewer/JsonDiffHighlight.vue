<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getAllChangedPaths, isPathChanged } from '@/utils/jsonDiff'

const props = defineProps<{
  current: unknown
  previous: unknown | null
}>()

const changedPaths = ref<Set<string>>(new Set())
const highlightKey = ref(0)

watch(
  () => [props.current, props.previous],
  ([curr, prev]) => {
    if (prev !== null && prev !== undefined) {
      changedPaths.value = getAllChangedPaths(prev, curr)
      highlightKey.value++
    } else {
      changedPaths.value = new Set()
    }
  },
  { deep: true }
)

interface JsonLine {
  content: string
  path: string
  isChanged: boolean
}

const jsonLines = computed((): JsonLine[] => {
  try {
    const json = JSON.stringify(props.current, null, 2)
    const rawLines = json.split('\n')

    return rawLines.map((line) => {
      const trimmed = line.trim()
      let path = ''

      const keyMatch = trimmed.match(/^"([^"]+)":\s*/)
      if (keyMatch) {
        path = keyMatch[1]
      }

      return {
        content: line,
        path,
        isChanged: path ? isPathChanged(path, changedPaths.value) : false,
      }
    })
  } catch {
    return [{ content: 'Invalid JSON', path: '', isChanged: false }]
  }
})
</script>

<template>
  <pre class="json-diff-highlight" :key="highlightKey"><code><span
    v-for="(line, index) in jsonLines"
    :key="index"
    :class="{ changed: line.isChanged }"
>{{ line.content }}
</span></code></pre>
</template>

<style scoped>
.json-diff-highlight {
  margin: 0;
  padding: 0;
  font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
  font-size: 0.8125rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  color: rgba(var(--v-theme-on-surface), 0.87);
}

.changed {
  animation: fade-highlight 5s ease-out forwards;
  display: inline;
}

@keyframes fade-highlight {
  from {
    background-color: rgba(255, 235, 59, 0.5);
  }
  to {
    background-color: transparent;
  }
}
</style>
