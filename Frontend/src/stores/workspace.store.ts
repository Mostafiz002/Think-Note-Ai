import { create } from "zustand"

type WorkspaceStore = {
  selectedFolderId: number | null
  setSelectedFolderId: (id: number | null) => void
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  selectedFolderId: null,
  setSelectedFolderId: (id) => set({ selectedFolderId: id }),
}))

