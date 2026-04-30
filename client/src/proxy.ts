import { NextResponse, type NextRequest } from "next/server"

import { AUTH_COOKIE_NAME } from "@/lib/auth"

const AUTH_ROUTES = ["/login", "/signup"] as const

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith("/api/")) return NextResponse.next()
  if (AUTH_ROUTES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next()
  }

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value
  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/app/:path*", "/"],
}

