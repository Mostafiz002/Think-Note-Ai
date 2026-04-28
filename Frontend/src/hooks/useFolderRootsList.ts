"use client"

import * as React from "react"
import { useWorkspaceStore } from "@/stores/workspace.store"

export type FolderRoot = { id: number; name: string; parentId: number | null }

export function useFolderRootsList() {
  const folders = useWorkspaceStore((s) => s.folders)
  
  return React.useMemo(() => {
    return folders.map((f) => ({ id: f.id, name: f.name, parentId: f.parentId }))
  }, [folders])
}

