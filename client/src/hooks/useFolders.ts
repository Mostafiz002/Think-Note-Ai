"use client"

import * as React from "react"
import { useWorkspaceStore, type Folder } from "@/stores/workspace.store"

export type { Folder }

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

export function useFolders(): FoldersState {
  const folders = useWorkspaceStore((s) => s.folders)
  const loading = useWorkspaceStore((s) => s.foldersLoading)
  const selectedFolderId = useWorkspaceStore((s) => s.selectedFolderId)
  const setSelectedFolderId = useWorkspaceStore((s) => s.setSelectedFolderId)
  const refreshFolders = useWorkspaceStore((s) => s.refreshFolders)
  const foldersFetched = useWorkspaceStore((s) => s.foldersFetched)
  const createFolder = useWorkspaceStore((s) => s.createFolder)
  const renameFolder = useWorkspaceStore((s) => s.renameFolder)
  const removeFolder = useWorkspaceStore((s) => s.removeFolder)

  const fetchingRef = React.useRef(false)

  React.useEffect(() => {
    if (!foldersFetched && !loading && !fetchingRef.current) {
      fetchingRef.current = true
      void refreshFolders().finally(() => {
        fetchingRef.current = false
      })
    }
  }, [foldersFetched, loading, refreshFolders])

  return {
    folders,
    loading,
    error: null,
    selectedFolderId,
    selectFolder: setSelectedFolderId,
    refresh: refreshFolders,
    create: (args) => createFolder(args.name),
    rename: (args) => renameFolder(args.id, args.name),
    remove: removeFolder,
  }
}

