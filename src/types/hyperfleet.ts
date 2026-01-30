export interface Condition {
  type: string
  status: string
  reason?: string
  message?: string
  last_transition_time?: string
}

export interface OwnerReference {
  api_version: string
  kind: string
  name: string
  uid: string
}

export interface Cluster {
  id: string
  name: string
  spec: Record<string, unknown>
  status: Record<string, unknown>
  labels?: Record<string, string>
  annotations?: Record<string, string>
  generation?: number
  created_at?: string
  updated_at?: string
}

export interface NodePool {
  id: string
  name: string
  cluster_id: string
  spec: Record<string, unknown>
  status: Record<string, unknown>
  labels?: Record<string, string>
  annotations?: Record<string, string>
  owner_references?: OwnerReference[]
  generation?: number
  created_at?: string
  updated_at?: string
}

export interface AdapterStatus {
  adapter: string
  observed_generation?: number
  conditions?: Condition[]
  data?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

export interface AdapterStatusPayload {
  adapter: string
  observed_generation?: number
  conditions?: Condition[]
  data?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

export type ResourceType = 'cluster' | 'nodepool'

export interface ClusterListResponse {
  items: Cluster[]
}

export interface NodePoolListResponse {
  items: NodePool[]
}

export interface StatusListResponse {
  items: AdapterStatus[]
}
