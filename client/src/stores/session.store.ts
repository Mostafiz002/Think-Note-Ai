import { create } from "zustand"

type SessionState = {
  ready: boolean
}

export const useSessionStore = create<SessionState>(() => ({
  ready: true,
}))

