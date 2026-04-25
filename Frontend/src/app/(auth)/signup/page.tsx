 "use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignupPage() {
  const router = useRouter()

  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      const form = new FormData(e.currentTarget)
      const name = String(form.get("name") ?? "")
      const email = String(form.get("email") ?? "")
      const password = String(form.get("password") ?? "")

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null
        throw new Error(data?.message ?? "Signup failed")
      }

      router.replace("/app")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh max-w-md items-center px-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Create your workspace</CardTitle>
            <CardDescription>Start capturing ideas in seconds.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" autoComplete="name" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" autoComplete="email" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" autoComplete="new-password" required />
              </div>

              {error ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              <Button type="submit" disabled={pending}>
                {pending ? "Creating..." : "Create account"}
              </Button>

              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link className="text-foreground underline underline-offset-4" href="/login">
                  Sign in
                </Link>
                .
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

