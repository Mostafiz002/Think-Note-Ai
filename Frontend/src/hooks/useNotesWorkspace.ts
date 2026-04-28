"use client"

import * as React from "react"
import { useWorkspaceStore } from "@/stores/workspace.store"
import type { Note } from "@/lib/types"

type WorkspaceState = {
  q: string
  setQ: (q: string) => void

  notes: Note[]
  notesLoading: boolean
  notesError: string | null

  selectedId: number | null
  select: (id: number | null) => void

  active: Note | null
  activeLoading: boolean
  activeError: string | null

  draftTitle: string
  setDraftTitle: (v: string) => void
  draftMarkdown: string
  setDraftMarkdown: (v: string) => void

  saving: boolean
  saveError: string | null

  refreshList: () => Promise<void>
  createNote: () => Promise<void>
  saveNow: () => Promise<void>
  moveToFolder: (folderId: number) => Promise<void>
  removeNote: (id: number) => Promise<void>
}

function useDebouncedEffect(effect: () => void, ms: number, deps: React.DependencyList) {
  React.useEffect(() => {
    const t = window.setTimeout(effect, ms)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

export function useNotesWorkspace(): WorkspaceState {
  const q = useWorkspaceStore((s) => s.q)
  const setQ = useWorkspaceStore((s) => s.setQ)
  const notes = useWorkspaceStore((s) => s.notes)
  const notesLoading = useWorkspaceStore((s) => s.notesLoading)
  const selectedNoteId = useWorkspaceStore((s) => s.selectedNoteId)
  const setSelectedNoteId = useWorkspaceStore((s) => s.setSelectedNoteId)
  const activeNote = useWorkspaceStore((s) => s.activeNote)
  const activeNoteLoading = useWorkspaceStore((s) => s.activeNoteLoading)
  const draftTitle = useWorkspaceStore((s) => s.draftTitle)
  const setDraftTitle = useWorkspaceStore((s) => s.setDraftTitle)
  const draftMarkdown = useWorkspaceStore((s) => s.draftMarkdown)
  const setDraftMarkdown = useWorkspaceStore((s) => s.setDraftMarkdown)
  
  const refreshNotes = useWorkspaceStore((s) => s.refreshNotes)
  const createNote = useWorkspaceStore((s) => s.createNote)
  const saveActiveNote = useWorkspaceStore((s) => s.saveActiveNote)
  const moveNote = useWorkspaceStore((s) => s.moveNote)
  const removeNote = useWorkspaceStore((s) => s.removeNote)

  // Autosave logic
  const lastSavedRef = React.useRef<{ id: number; title: string; markdown: string } | null>(null)
  
  React.useEffect(() => {
    if (!selectedNoteId) return
    lastSavedRef.current = { 
      id: selectedNoteId, 
      title: draftTitle, 
      markdown: draftMarkdown 
    }
  }, [selectedNoteId])

  useDebouncedEffect(
    () => {
      if (!selectedNoteId || activeNoteLoading) return
      const last = lastSavedRef.current
      if (!last || last.id !== selectedNoteId) return
      if (last.title === draftTitle && last.markdown === draftMarkdown) return
      
      void saveActiveNote()
      lastSavedRef.current = { 
        id: selectedNoteId, 
        title: draftTitle, 
        markdown: draftMarkdown 
      }
    },
    800,
    [draftTitle, draftMarkdown, selectedNoteId, activeNoteLoading, saveActiveNote]
  )

  return {
    q,
    setQ,

    notes,
    notesLoading,
    notesError: null,

    selectedId: selectedNoteId,
    select: setSelectedNoteId,

    active: activeNote,
    activeLoading: activeNoteLoading,
    activeError: null,

    draftTitle,
    setDraftTitle,
    draftMarkdown,
    setDraftMarkdown,

    saving: false, 
    saveError: null,

    refreshList: refreshNotes,
    createNote,
    saveNow: saveActiveNote,
    moveToFolder: (folderId: number) => {
      if (selectedNoteId) return moveNote(selectedNoteId, folderId)
      return Promise.resolve()
    },
    removeNote,
  }
}

