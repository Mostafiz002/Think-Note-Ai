import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { AUTH_COOKIE_NAME } from "@/lib/auth"
import { env } from "@/lib/env"

export async function POST(req: Request) {
  const body = (await req.json()) as { email?: string; password?: string }

  const upstream = await fetch(`${env.backendUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })

  const payload = (await upstream.json()) as unknown
  if (!upstream.ok) {
    return NextResponse.json(payload, { status: upstream.status })
  }

  const token = (payload as { access_token?: string }).access_token
  if (!token) {
    return NextResponse.json(
      { message: "Login response missing access_token" },
      { status: 502 }
    )
  }

  const jar = await cookies()
  jar.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  })

  return NextResponse.json({ ok: true })
}

