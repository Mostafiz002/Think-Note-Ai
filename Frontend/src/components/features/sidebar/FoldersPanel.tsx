"use client"

import * as React from "react"
import { Check, FolderPlus, Folder as FolderIcon, Loader2, PencilLine } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useFolders, type Folder } from "@/hooks/useFolders"
import { cn } from "@/lib/utils"

function renderTree(args: {
  nodes: Folder[]
  depth?: number
  selectedId: number | null
  onSelect: (id: number) => void
  renamingId: number | null
  renameValue: string
  setRenameValue: (v: string) => void
  startRename: (folder: Folder) => void
  commitRename: () => void
}): React.ReactNode {
  const depth = args.depth ?? 0
  return args.nodes.map((f) => (
    <div key={f.id}>
      <div
          role="button"
          tabIndex={0}
        onClick={() => args.onSelect(f.id)}
        className={cn(
          "group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted/40",
          "cursor-pointer",
          args.selectedId === f.id ? "bg-primary/10" : ""
        )}
        style={{ paddingLeft: 8 + depth * 12 }}
      >
        <FolderIcon className="size-4 text-muted-foreground" />
        {args.renamingId === f.id ? (
          <span className="flex min-w-0 flex-1 items-center gap-1">
            <Input
              value={args.renameValue}
              onChange={(e) => args.setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") args.commitRename()
                if (e.key === "Escape") args.startRename({ ...f, name: "" })
              }}
              className="h-7 flex-1"
              autoFocus
            />
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="cursor-pointer"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                args.commitRename()
              }}
              aria-label="Save folder name"
            >
              <Check className="size-4" />
            </Button>
          </span>
        ) : (
          <>
            <span className="min-w-0 flex-1 truncate">{f.name}</span>
            <span className="opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                className="cursor-pointer"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  args.startRename(f)
                }}
                aria-label="Rename folder"
              >
                <PencilLine className="size-4" />
              </Button>
            </span>
          </>
        )}
      </div>
      {f.children?.length ? (
        <div>
          {renderTree({
            ...args,
            nodes: f.children,
            depth: depth + 1,
          })}
        </div>
      ) : null}
    </div>
  ))
}

export function FoldersPanel() {
  const folders = useFolders()
  const [name, setName] = React.useState("")
  const [renamingId, setRenamingId] = React.useState<number | null>(null)
  const [renameValue, setRenameValue] = React.useState("")

  const startRename = React.useCallback((folder: Folder) => {
    if (!folder.name) {
      setRenamingId(null)
      setRenameValue("")
      return
    }
    setRenamingId(folder.id)
    setRenameValue(folder.name)
  }, [])

  const commitRename = React.useCallback(() => {
    const id = renamingId
    const v = renameValue.trim()
    if (!id || !v) {
      setRenamingId(null)
      return
    }
    void folders.rename({ id, name: v })
    setRenamingId(null)
  }, [folders, renamingId, renameValue])

  const createRoot = React.useCallback(() => {
    const v = name.trim()
    if (!v) return
    void folders.create({ name: v })
    setName("")
  }, [folders, name])

  const createSub = React.useCallback(() => {
    const v = name.trim()
    if (!v || !folders.selectedFolderId) return
    void folders.create({ name: v, parentId: folders.selectedFolderId })
    setName("")
  }, [folders, name])

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Folders
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="cursor-pointer"
            onClick={createRoot}
            aria-label="Create root folder"
            disabled={folders.loading || !name.trim()}
          >
            <FolderPlus className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="cursor-pointer"
            onClick={createSub}
            aria-label="Create subfolder"
            disabled={folders.loading || !name.trim() || !folders.selectedFolderId}
          >
            <FolderIcon className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={folders.selectedFolderId ? "New folder or subfolder…" : "New folder…"}
          className="h-8"
          onKeyDown={(e) => {
            if (e.key !== "Enter") return
            e.preventDefault()
            if (folders.selectedFolderId) createSub()
            else createRoot()
          }}
        />
      </div>

      {folders.error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {folders.error}
        </div>
      ) : null}

      <div className="flex-1 overflow-auto rounded-xl border bg-background/30 p-2">
        {folders.loading ? (
          <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading…
          </div>
        ) : folders.folders.length ? (
          <div className="grid gap-0.5">
            {renderTree({
              nodes: folders.folders,
              selectedId: folders.selectedFolderId,
              onSelect: folders.selectFolder,
              renamingId,
              renameValue,
              setRenameValue,
              startRename,
              commitRename,
            })}
          </div>
        ) : (
          <div className="p-2 text-sm text-muted-foreground">No folders yet.</div>
        )}
      </div>
    </div>
  )
}

