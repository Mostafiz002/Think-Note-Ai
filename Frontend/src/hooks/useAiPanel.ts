"use client"

import * as React from "react"

import { apiFetch } from "@/lib/api"

type AiAction = "summarize" | "rewrite" | "generate-title" | "key-points"

type AiState = {
  running: AiAction | null
  error: string | null
  summary: string | null
  keyPoints: string[] | null
  run: (action: AiAction, args: { noteId: number; instruction?: string }) => Promise<unknown>
  clear: () => void
}

export function useAiPanel(): AiState {
  const [running, setRunning] = React.useState<AiAction | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [summary, setSummary] = React.useState<string | null>(null)
  const [keyPoints, setKeyPoints] = React.useState<string[] | null>(null)

  const clear = React.useCallback(() => {
    setError(null)
    setSummary(null)
    setKeyPoints(null)
  }, [])

  const run = React.useCallback(
    async (action: AiAction, args: { noteId: number; instruction?: string }) => {
      setError(null)
      setRunning(action)
      try {
        const data = await apiFetch<unknown>(`/api/v1/ai/${action}`, {
          method: "POST",
          body: JSON.stringify(args),
        })
        if (action === "summarize") {
          const s = (data as { summary?: unknown }).summary
          setSummary(typeof s === "string" ? s : null)
        }
        if (action === "key-points") {
          const kp = (data as { keyPoints?: unknown }).keyPoints
          setKeyPoints(Array.isArray(kp) ? kp.filter((x) => typeof x === "string") : null)
        }
        return data
      } catch (err) {
        setError(err instanceof Error ? err.message : "AI request failed")
        throw err
      } finally {
        setRunning(null)
      }
    },
    []
  )

  return { running, error, summary, keyPoints, run, clear }
}

