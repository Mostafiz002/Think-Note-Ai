import { NextResponse } from "next/server"

import { env } from "@/lib/env"

export async function POST(req: Request) {
  const body = (await req.json()) as { email?: string }

  const upstream = await fetch(`${env.backendUrl}/api/auth/resend-otp`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })

  const payload = (await upstream.json().catch(() => null)) as unknown
  if (!upstream.ok) {
    return NextResponse.json(payload, { status: upstream.status })
  }

  return NextResponse.json({ ok: true })
}
