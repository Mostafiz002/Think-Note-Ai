"use client"

import * as React from "react"
import { apiFetch } from "@/lib/api"
import { toast } from "sonner"

type AiAction = "summarize" | "rewrite" | "generate-title" | "key-points" | "chat"

type AiState = {
  running: AiAction | null
  error: string | null
  summary: string | null
  keyPoints: string[] | null
  chatResponse: string | null
  attachments: File[]
  
  run: (action: AiAction, args: { noteId: number; instruction?: string }) => Promise<unknown>
  chat: (args: { instruction: string; noteId?: number }) => Promise<void>
  addAttachments: (files: FileList | File[]) => void
  removeAttachment: (index: number) => void
  clear: () => void
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_PDF_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_FILES = 3

export function useAiPanel(): AiState {
  const [running, setRunning] = React.useState<AiAction | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [summary, setSummary] = React.useState<string | null>(null)
  const [keyPoints, setKeyPoints] = React.useState<string[] | null>(null)
  const [chatResponse, setChatResponse] = React.useState<string | null>(null)
  const [attachments, setAttachments] = React.useState<File[]>([])

  const clear = React.useCallback(() => {
    setError(null)
    setSummary(null)
    setKeyPoints(null)
    setChatResponse(null)
    setAttachments([])
  }, [])

  const addAttachments = React.useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files)
    
    if (attachments.length + fileArray.length > MAX_FILES) {
      toast.error(`You can only upload up to ${MAX_FILES} files.`)
      return
    }

    const validFiles: File[] = []
    for (const file of fileArray) {
      if (file.type.startsWith("image/")) {
        if (file.size > MAX_IMAGE_SIZE) {
          toast.error(`${file.name} is too large (max 5MB for images)`)
          continue
        }
      } else if (file.type === "application/pdf") {
        if (file.size > MAX_PDF_SIZE) {
          toast.error(`${file.name} is too large (max 10MB for PDFs)`)
          continue
        }
      } else {
        toast.error(`${file.name} is not a supported file type (Images and PDFs only)`)
        continue
      }
      validFiles.push(file)
    }

    setAttachments((prev) => [...prev, ...validFiles])
  }, [attachments])

  const removeAttachment = React.useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const run = React.useCallback(
    async (action: AiAction, args: { noteId: number; instruction?: string }) => {
      setError(null)
      setRunning(action)
      try {
        const data = await apiFetch<unknown>(`/api/v1/ai/${action}`, {
          method: "POST",
          body: args,
        })
        if (action === "summarize") {
          const s = (data as { summary?: unknown }).summary
          setSummary(typeof s === "string" ? s : null)
        }
        if (action === "key-points") {
          const kp = (data as { keyPoints?: unknown }).keyPoints
          setKeyPoints(Array.isArray(kp) ? kp.filter((x) => typeof x === "string") : null)
        }
        toast.success(`${action.replace("-", " ")} completed`)
        return data
      } catch (err) {
        const msg = err instanceof Error ? err.message : "AI request failed"
        setError(msg)
        toast.error(msg)
        throw err
      } finally {
        setRunning(null)
      }
    },
    []
  )

  const chat = React.useCallback(
    async (args: { instruction: string; noteId?: number }) => {
      if (!args.instruction.trim()) {
        toast.error("Please enter an instruction.")
        return
      }

      setError(null)
      setRunning("chat")
      setChatResponse(null)

      try {
        const formData = new FormData()
        formData.append("instruction", args.instruction)
        if (args.noteId) formData.append("noteId", String(args.noteId))
        
        attachments.forEach((file) => {
          formData.append("files", file)
        })

        const data = await apiFetch<{ response: string }>("/api/v1/ai/chat", {
          method: "POST",
          body: formData,
        })

        setChatResponse(data.response)
        setAttachments([]) // Clear attachments on success
        toast.success("AI response received")
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Chat request failed"
        setError(msg)
        toast.error(msg)
      } finally {
        setRunning(null)
      }
    },
    [attachments]
  )

  return { 
    running, 
    error, 
    summary, 
    keyPoints, 
    chatResponse,
    attachments,
    run, 
    chat,
    addAttachments,
    removeAttachment,
    clear 
  }
}
