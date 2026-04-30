import { Suspense } from "react"

import { LoginForm } from "./ui"

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-background" />}>
      <LoginForm />
    </Suspense>
  )
}

