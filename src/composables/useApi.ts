import { useConnectionStore } from '@/stores/connection'
import type {
  Cluster,
  NodePool,
  AdapterStatus,
  AdapterStatusPayload,
  ClusterListResponse,
  NodePoolListResponse,
  StatusListResponse,
} from '@/types/hyperfleet'

export function useApi() {
  const connectionStore = useConnectionStore()

  async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${connectionStore.apiBaseUrl}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  async function getClusters(): Promise<Cluster[]> {
    const response = await fetchJson<ClusterListResponse>('/api/hyperfleet/v1/clusters')
    return response.items || []
  }

  async function getCluster(clusterId: string): Promise<Cluster> {
    return fetchJson<Cluster>(`/api/hyperfleet/v1/clusters/${clusterId}`)
  }

  async function getClusterStatuses(clusterId: string): Promise<AdapterStatus[]> {
    const response = await fetchJson<StatusListResponse>(
      `/api/hyperfleet/v1/clusters/${clusterId}/statuses`
    )
    return response.items || []
  }

  async function getNodePools(clusterId: string): Promise<NodePool[]> {
    const response = await fetchJson<NodePoolListResponse>(
      `/api/hyperfleet/v1/clusters/${clusterId}/nodepools`
    )
    return response.items || []
  }

  async function getNodePool(clusterId: string, nodePoolId: string): Promise<NodePool> {
    return fetchJson<NodePool>(
      `/api/hyperfleet/v1/clusters/${clusterId}/nodepools/${nodePoolId}`
    )
  }

  async function getNodePoolStatuses(
    clusterId: string,
    nodePoolId: string
  ): Promise<AdapterStatus[]> {
    const response = await fetchJson<StatusListResponse>(
      `/api/hyperfleet/v1/clusters/${clusterId}/nodepools/${nodePoolId}/statuses`
    )
    return response.items || []
  }

  async function postClusterStatus(
    clusterId: string,
    payload: AdapterStatusPayload
  ): Promise<AdapterStatus> {
    return fetchJson<AdapterStatus>(`/api/hyperfleet/v1/clusters/${clusterId}/statuses`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async function postNodePoolStatus(
    clusterId: string,
    nodePoolId: string,
    payload: AdapterStatusPayload
  ): Promise<AdapterStatus> {
    return fetchJson<AdapterStatus>(
      `/api/hyperfleet/v1/clusters/${clusterId}/nodepools/${nodePoolId}/statuses`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    )
  }

  async function testConnection(): Promise<boolean> {
    try {
      await getClusters()
      return true
    } catch {
      return false
    }
  }

  return {
    getClusters,
    getCluster,
    getClusterStatuses,
    getNodePools,
    getNodePool,
    getNodePoolStatuses,
    postClusterStatus,
    postNodePoolStatus,
    testConnection,
  }
}
