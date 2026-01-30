export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

export interface DiffResult {
  changedPaths: Set<string>
  addedPaths: Set<string>
  removedPaths: Set<string>
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

export function findChangedPaths(
  oldValue: unknown,
  newValue: unknown,
  currentPath: string = ''
): DiffResult {
  const result: DiffResult = {
    changedPaths: new Set(),
    addedPaths: new Set(),
    removedPaths: new Set(),
  }

  if (oldValue === newValue) {
    return result
  }

  if (oldValue === undefined && newValue !== undefined) {
    result.addedPaths.add(currentPath || '$')
    return result
  }

  if (oldValue !== undefined && newValue === undefined) {
    result.removedPaths.add(currentPath || '$')
    return result
  }

  if (typeof oldValue !== typeof newValue) {
    result.changedPaths.add(currentPath || '$')
    return result
  }

  if (isArray(oldValue) && isArray(newValue)) {
    const maxLen = Math.max(oldValue.length, newValue.length)
    for (let i = 0; i < maxLen; i++) {
      const path = currentPath ? `${currentPath}[${i}]` : `[${i}]`
      const childDiff = findChangedPaths(oldValue[i], newValue[i], path)
      childDiff.changedPaths.forEach((p) => result.changedPaths.add(p))
      childDiff.addedPaths.forEach((p) => result.addedPaths.add(p))
      childDiff.removedPaths.forEach((p) => result.removedPaths.add(p))
    }
    return result
  }

  if (isObject(oldValue) && isObject(newValue)) {
    const allKeys = new Set([...Object.keys(oldValue), ...Object.keys(newValue)])
    for (const key of allKeys) {
      const path = currentPath ? `${currentPath}.${key}` : key
      const childDiff = findChangedPaths(oldValue[key], newValue[key], path)
      childDiff.changedPaths.forEach((p) => result.changedPaths.add(p))
      childDiff.addedPaths.forEach((p) => result.addedPaths.add(p))
      childDiff.removedPaths.forEach((p) => result.removedPaths.add(p))
    }
    return result
  }

  if (oldValue !== newValue) {
    result.changedPaths.add(currentPath || '$')
  }

  return result
}

export function getAllChangedPaths(oldValue: unknown, newValue: unknown): Set<string> {
  const diff = findChangedPaths(oldValue, newValue)
  const allPaths = new Set<string>()
  diff.changedPaths.forEach((p) => allPaths.add(p))
  diff.addedPaths.forEach((p) => allPaths.add(p))
  diff.removedPaths.forEach((p) => allPaths.add(p))
  return allPaths
}

export function isPathChanged(path: string, changedPaths: Set<string>): boolean {
  if (changedPaths.has(path)) {
    return true
  }
  for (const changedPath of changedPaths) {
    if (changedPath.startsWith(path + '.') || changedPath.startsWith(path + '[')) {
      return true
    }
    if (path.startsWith(changedPath + '.') || path.startsWith(changedPath + '[')) {
      return true
    }
  }
  return false
}
