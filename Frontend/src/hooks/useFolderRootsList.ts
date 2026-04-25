"use client"

import * as React from "react"

import { apiFetch } from "@/lib/api"

export type FolderRoot = { id: number; name: string; parentId: number | null }

export function useFolderRootsList() {
  const [folders, setFolders] = React.useState<FolderRoot[]>([])

  React.useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const all = await apiFetch<FolderRoot[]>("/api/v1/folders", { cache: "no-store" })
        if (cancelled) return
        setFolders(all.filter((f) => f.parentId == null))
      } catch {
        if (!cancelled) setFolders([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return folders
}

