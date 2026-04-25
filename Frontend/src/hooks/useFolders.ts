"use client"

import * as React from "react"

import { apiFetch } from "@/lib/api"
import { useWorkspaceStore } from "@/stores/workspace.store"

export type Folder = {
  id: number
  name: string
  parentId: number | null
  children?: Folder[]
}

type FoldersState = {
  folders: Folder[]
  loading: boolean
  error: string | null
  selectedFolderId: number | null
  selectFolder: (id: number) => void
  refresh: () => Promise<void>
  create: (args: { name: string; parentId?: number | null }) => Promise<void>
  rename: (args: { id: number; name: string }) => Promise<void>
}

function findFirstFolderId(nodes: Folder[]): number | null {
  const first = nodes[0]
  if (!first) return null
  return first.id
}

export function useFolders(): FoldersState {
  const [folders, setFolders] = React.useState<Folder[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const selectedFolderId = useWorkspaceStore((s) => s.selectedFolderId)
  const setSelectedFolderId = useWorkspaceStore((s) => s.setSelectedFolderId)

  const refresh = React.useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const data = await apiFetch<Folder[]>("/api/v1/folders", { cache: "no-store" })
      if (data.length === 0) {
        await apiFetch<unknown>("/api/v1/folders", {
          method: "POST",
          body: JSON.stringify({ name: "General", parentId: null }),
        })
        const again = await apiFetch<Folder[]>("/api/v1/folders", { cache: "no-store" })
        setFolders(again)
        const firstId = findFirstFolderId(again)
        if (firstId) setSelectedFolderId(firstId)
        return
      }

      setFolders(data)
      if (!selectedFolderId) {
        const firstId = findFirstFolderId(data)
        if (firstId) setSelectedFolderId(firstId)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load folders")
    } finally {
      setLoading(false)
    }
  }, [selectedFolderId, setSelectedFolderId])

  React.useEffect(() => {
    void refresh()
  }, [refresh])

  const selectFolder = React.useCallback(
    (id: number) => {
      setSelectedFolderId(id)
    },
    [setSelectedFolderId]
  )

  const create = React.useCallback(
    async (args: { name: string; parentId?: number | null }) => {
      setError(null)
      try {
        await apiFetch<unknown>("/api/v1/folders", {
          method: "POST",
          body: JSON.stringify({ name: args.name, parentId: args.parentId ?? null }),
        })
        await refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create folder")
      }
    },
    [refresh]
  )

  const rename = React.useCallback(
    async (args: { id: number; name: string }) => {
      setError(null)
      try {
        await apiFetch<unknown>(`/api/v1/folders/${args.id}`, {
          method: "PATCH",
          body: JSON.stringify({ name: args.name }),
        })
        await refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to rename folder")
      }
    },
    [refresh]
  )

  return {
    folders,
    loading,
    error,
    selectedFolderId,
    selectFolder,
    refresh,
    create,
    rename,
  }
}

