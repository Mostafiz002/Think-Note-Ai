"use client"

import * as React from "react"
import { FilePlus2, Loader2, PencilLine, Sparkles, Save, Search, Wand2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAiPanel } from "@/hooks/useAiPanel"
import { useFolderRootsList } from "@/hooks/useFolderRootsList"
import { useNotesWorkspace } from "@/hooks/useNotesWorkspace"
import { cn } from "@/lib/utils"

export function Workspace() {
  const ws = useNotesWorkspace()
  const ai = useAiPanel()
  const [instruction, setInstruction] = React.useState("")
  const folderRoots = useFolderRootsList()

  return (
    <div className="relative flex flex-1">
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_1px_1px,hsl(var(--foreground))_1px,transparent_0)] bg-size-[22px_22px]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 gap-4 px-4 py-4">
        <section className="flex w-full flex-col gap-3 md:w-80">
          <div className="rounded-2xl border bg-background/40 p-3 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={ws.q}
                  onChange={(e) => ws.setQ(e.target.value)}
                  placeholder="Search notes…"
                  className="pl-9"
                />
              </div>
              <Button onClick={() => void ws.createNote()} className="cursor-pointer">
                <FilePlus2 className="mr-2 size-4" />
                New
              </Button>
            </div>
            {ws.notesError ? (
              <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {ws.notesError}
              </div>
            ) : null}
          </div>

          <div className="flex-1 overflow-hidden rounded-2xl border bg-background/40 backdrop-blur-xl">
            <div className="max-h-[calc(100dvh-12rem)] overflow-auto p-2">
              {ws.notesLoading ? (
                <div className="p-3 text-sm text-muted-foreground">Loading notes…</div>
              ) : ws.notes.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground">No notes yet.</div>
              ) : (
                <div className="grid gap-1">
                  {ws.notes.map((n) => {
                    const active = ws.selectedId === n.id
                    return (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => ws.select(n.id)}
                        className={cn(
                          "cursor-pointer rounded-xl border px-3 py-2 text-left transition-colors",
                          active
                            ? "border-ring/40 bg-primary/5 shadow-[0_0_0_1px_hsl(var(--ring)/0.15)]"
                            : "border-transparent hover:border-border hover:bg-muted/40"
                        )}
                      >
                        <div className="truncate text-sm font-medium">{n.title || "Untitled"}</div>
                        <div className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                          {new Date(n.updatedAt).toLocaleString()}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="hidden flex-1 md:flex">
          <div className="flex w-full flex-col overflow-hidden rounded-2xl border bg-background/40 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="group relative">
                  <Input
                    value={ws.draftTitle}
                    onChange={(e) => ws.setDraftTitle(e.target.value)}
                    placeholder="Untitled"
                    className="h-9 border-transparent bg-transparent px-0 pr-8 text-base font-semibold shadow-none focus-visible:ring-0"
                  />
                  <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 opacity-60 transition-opacity group-hover:opacity-100">
                    <PencilLine className="size-4 text-muted-foreground" />
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {ws.saving ? (
                  <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin" />
                    Saving…
                  </div>
                ) : (
                  <div className="font-mono text-xs text-muted-foreground">Autosave</div>
                )}
                <label className="hidden items-center gap-2 rounded-lg border bg-background/30 px-2 py-1 text-xs text-muted-foreground md:flex">
                  <span className="font-mono">Folder</span>
                  <select
                    className="cursor-pointer bg-transparent text-xs text-foreground outline-none"
                    value={ws.active?.folderId ?? ""}
                    onChange={(e) => {
                      const nextId = Number(e.target.value)
                      if (!Number.isFinite(nextId)) return
                      void ws.moveToFolder(nextId)
                    }}
                    disabled={!ws.selectedId || ws.activeLoading}
                  >
                    {folderRoots.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void ws.saveNow()}
                  className="cursor-pointer"
                  disabled={!ws.selectedId || ws.activeLoading || ws.saving}
                >
                  <Save className="mr-2 size-4" />
                  Save
                </Button>
              </div>
            </div>

            {ws.activeError ? (
              <div className="m-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {ws.activeError}
              </div>
            ) : null}

            {ws.saveError ? (
              <div className="m-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {ws.saveError}
              </div>
            ) : null}

            <div className="flex-1 overflow-auto p-4">
              {ws.activeLoading ? (
                <div className="text-sm text-muted-foreground">Loading…</div>
              ) : ws.selectedId ? (
                <div className="grid gap-3">
                  <div className="rounded-2xl border bg-muted/20 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Sparkles className="size-4 text-primary" />
                        <span className="bg-linear-to-r from-primary to-violet-400 bg-clip-text text-transparent">
                          AI
                        </span>
                      </div>
                      <Input
                        value={instruction}
                        onChange={(e) => setInstruction(e.target.value)}
                        placeholder="Optional instruction (e.g., “make it shorter, keep tone”)"
                        className="h-8 flex-1"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="ai-glow cursor-pointer border-white/10 bg-background/40 backdrop-blur transition-transform hover:scale-[1.02]"
                        disabled={ai.running !== null}
                        onClick={() =>
                          void ai.run("summarize", { noteId: ws.selectedId!, instruction }).catch(() => {})
                        }
                      >
                        <Wand2 className="mr-2 size-4" />
                        Summarize
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="ai-glow cursor-pointer border-white/10 bg-background/40 backdrop-blur transition-transform hover:scale-[1.02]"
                        disabled={ai.running !== null}
                        onClick={() =>
                          void ai
                            .run("rewrite", { noteId: ws.selectedId!, instruction })
                            .then((d) => {
                              const rewritten = (d as { rewrittenContent?: unknown }).rewrittenContent
                              if (typeof rewritten === "string") ws.setDraftMarkdown(rewritten)
                            })
                            .catch(() => {})
                        }
                      >
                        <Wand2 className="mr-2 size-4" />
                        Rewrite
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="ai-glow cursor-pointer border-white/10 bg-background/40 backdrop-blur transition-transform hover:scale-[1.02]"
                        disabled={ai.running !== null}
                        onClick={() =>
                          void ai
                            .run("generate-title", { noteId: ws.selectedId!, instruction })
                            .then((d) => {
                              const t = (d as { title?: unknown }).title
                              if (typeof t === "string") ws.setDraftTitle(t)
                            })
                            .catch(() => {})
                        }
                      >
                        <Wand2 className="mr-2 size-4" />
                        Title
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="ai-glow cursor-pointer border-white/10 bg-background/40 backdrop-blur transition-transform hover:scale-[1.02]"
                        disabled={ai.running !== null}
                        onClick={() =>
                          void ai.run("key-points", { noteId: ws.selectedId!, instruction }).catch(() => {})
                        }
                      >
                        <Wand2 className="mr-2 size-4" />
                        Key points
                      </Button>
                    </div>

                    {ai.error ? (
                      <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {ai.error}
                      </div>
                    ) : null}

                    {ai.summary ? (
                      <div className="mt-3 rounded-xl border bg-background/50 px-3 py-2 text-sm">
                        <div className="mb-1 font-mono text-xs text-muted-foreground">Summary</div>
                        <div className="whitespace-pre-wrap">{ai.summary}</div>
                      </div>
                    ) : null}

                    {ai.keyPoints?.length ? (
                      <div className="mt-3 rounded-xl border bg-background/50 px-3 py-2 text-sm">
                        <div className="mb-1 font-mono text-xs text-muted-foreground">Key points</div>
                        <ul className="list-disc pl-5">
                          {ai.keyPoints.map((kp, idx) => (
                            <li key={idx}>{kp}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>

                  <Textarea
                    value={ws.draftMarkdown}
                    onChange={(e) => ws.setDraftMarkdown(e.target.value)}
                    placeholder="Write in Markdown…"
                    className="min-h-[60dvh] resize-none bg-background/60 font-sans"
                  />
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Select or create a note.</div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

