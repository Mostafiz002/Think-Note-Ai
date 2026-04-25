"use client"

import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/hooks/useTheme"

export function ThemeToggle() {
  const { theme, toggle } = useTheme()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={toggle}
      aria-label="Toggle theme"
      className="cursor-pointer"
    >
      {theme === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </Button>
  )
}

