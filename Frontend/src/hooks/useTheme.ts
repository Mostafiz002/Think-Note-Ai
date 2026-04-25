"use client"

import * as React from "react"

export type ThemeMode = "dark" | "light"

const STORAGE_KEY = "tn_theme"

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement
  if (theme === "dark") root.classList.add("dark")
  else root.classList.remove("dark")
}

export function useTheme() {
  const [theme, setTheme] = React.useState<ThemeMode>("dark")

  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    const initial = stored === "light" || stored === "dark" ? (stored as ThemeMode) : "dark"
    setTheme(initial)
    applyTheme(initial)
  }, [])

  const update = React.useCallback((next: ThemeMode) => {
    setTheme(next)
    window.localStorage.setItem(STORAGE_KEY, next)
    applyTheme(next)
  }, [])

  const toggle = React.useCallback(() => {
    update(theme === "dark" ? "light" : "dark")
  }, [theme, update])

  return { theme, setTheme: update, toggle }
}

