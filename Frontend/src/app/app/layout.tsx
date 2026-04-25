import type { ReactNode } from "react"
import Link from "next/link"
import { LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { FoldersPanel } from "@/components/features/sidebar/FoldersPanel"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <div className="flex min-h-dvh">
        <aside className="hidden w-72 border-r bg-sidebar text-sidebar-foreground md:flex md:flex-col">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/app" className="text-sm font-semibold tracking-tight">
              Think Note AI
            </Link>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <form action="/api/auth/logout" method="post">
                <Button
                  variant="outline"
                  size="sm"
                  type="submit"
                  className="cursor-pointer border-white/10 bg-background/40 backdrop-blur transition-transform hover:scale-[1.02]"
                >
                  <LogOut className="mr-2 size-4" />
                  Logout
                </Button>
              </form>
            </div>
          </div>
          <div className="flex-1 px-4 py-3">
            <FoldersPanel />
          </div>
        </aside>
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  )
}

