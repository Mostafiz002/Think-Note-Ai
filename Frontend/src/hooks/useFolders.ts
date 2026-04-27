"use client"

import * as React from "react"
import { apiFetch } from "@/lib/api"
import { useWorkspaceStore } from "@/stores/workspace.store"
import { toast } from "sonner"

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
  create: (args: { name: string }) => Promise<void>
  rename: (args: { id: number; name: string }) => Promise<void>
  remove: (id: number) => Promise<void>
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
    setLoading(true)
    try {
      const data = await apiFetch<Folder[]>("/api/v1/folders", { cache: "no-store" })
      setFolders(data)
      if (!selectedFolderId) {
        const firstId = findFirstFolderId(data)
        if (firstId) setSelectedFolderId(firstId)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load folders"
      setError(msg)
      toast.error(msg)
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
    async (args: { name: string }) => {
      try {
        await apiFetch<unknown>("/api/v1/folders", {
          method: "POST",
          body: JSON.stringify({ name: args.name, parentId: null }),
        })
        toast.success(`Folder "${args.name}" created`)
        await refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to create folder")
      }
    },
    [refresh]
  )

  const rename = React.useCallback(
    async (args: { id: number; name: string }) => {
      try {
        await apiFetch<unknown>(`/api/v1/folders/${args.id}`, {
          method: "PATCH",
          body: JSON.stringify({ name: args.name }),
        })
        toast.success(`Folder renamed to "${args.name}"`)
        await refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to rename folder")
      }
    },
    [refresh]
  )

  const remove = React.useCallback(
    async (id: number) => {
      const folderName = folders.find(f => f.id === id)?.name || "folder"
      try {
        await apiFetch<unknown>(`/api/v1/folders/${id}`, {
          method: "DELETE",
        })
        toast.success(`Folder "${folderName}" deleted`)
        if (selectedFolderId === id) {
          setSelectedFolderId(null)
        }
        await refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete folder")
      }
    },
    [refresh, selectedFolderId, setSelectedFolderId, folders]
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
    remove,
  }
}

