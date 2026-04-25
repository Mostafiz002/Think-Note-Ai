import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/lib/auth"

export async function POST(req: Request) {
  const jar = await cookies()
  jar.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })
  jar.set(REFRESH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })

  return NextResponse.redirect(new URL("/login", req.url), { status: 303 })
}

