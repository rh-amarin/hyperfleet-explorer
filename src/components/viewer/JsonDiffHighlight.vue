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

    // Track the path stack as we parse the JSON structure
    const pathStack: (string | number)[] = []
    const arrayIndexStack: number[] = []

    return rawLines.map((line) => {
      const trimmed = line.trim()
      let linePath = ''

      // Detect closing brackets - pop from stack
      if (trimmed === '}' || trimmed === '},' || trimmed === ']' || trimmed === '],') {
        pathStack.pop()
        if (trimmed === ']' || trimmed === '],') {
          arrayIndexStack.pop()
        }
      }

      // Detect array element start (object in array)
      if (trimmed === '{' && arrayIndexStack.length > 0) {
        const idx = arrayIndexStack[arrayIndexStack.length - 1]
        pathStack.push(idx)
        arrayIndexStack[arrayIndexStack.length - 1] = idx + 1
      }

      // Detect opening array bracket
      const arrayStartMatch = trimmed.match(/^"([^"]+)":\s*\[$/)
      if (arrayStartMatch) {
        pathStack.push(arrayStartMatch[1])
        arrayIndexStack.push(0)
      } else if (trimmed === '[') {
        // Root-level array
        arrayIndexStack.push(0)
      }

      // Detect opening object bracket with key
      const objectStartMatch = trimmed.match(/^"([^"]+)":\s*\{$/)
      if (objectStartMatch) {
        pathStack.push(objectStartMatch[1])
      }

      // Detect key-value pairs
      const keyMatch = trimmed.match(/^"([^"]+)":\s*/)
      if (keyMatch && !arrayStartMatch && !objectStartMatch) {
        const key = keyMatch[1]
        // Build full path from stack
        const fullPath = buildPath(pathStack, key)
        linePath = fullPath
      }

      return {
        content: line,
        path: linePath,
        isChanged: linePath ? isPathChanged(linePath, changedPaths.value) : false,
      }
    })
  } catch {
    return [{ content: 'Invalid JSON', path: '', isChanged: false }]
  }
})

function buildPath(stack: (string | number)[], key: string): string {
  let path = ''
  for (const segment of stack) {
    if (typeof segment === 'number') {
      path += `[${segment}]`
    } else {
      path += path ? `.${segment}` : segment
    }
  }
  path += path ? `.${key}` : key
  return path
}
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
