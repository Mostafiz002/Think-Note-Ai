import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { bearerFromToken, AUTH_COOKIE_NAME } from "@/lib/auth"
import { env } from "@/lib/env"

type Params = { path: string[] }

async function proxy(req: Request, params: Params) {
  const jar = await cookies()
  const token = jar.get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(req.url)
  const upstreamUrl = new URL(`${env.backendUrl}/api/v1/${params.path.join("/")}`)
  upstreamUrl.search = url.search

  const headers = new Headers(req.headers)
  headers.set("authorization", bearerFromToken(token))
  headers.delete("host")

  let upstream: Response
  try {
    upstream = await fetch(upstreamUrl, {
      method: req.method,
      headers,
      body: req.method === "GET" || req.method === "HEAD" ? undefined : req.body,
      // @ts-expect-error - required when streaming a body through fetch in Node runtimes
      duplex: "half",
    })
  } catch (err) {
    return NextResponse.json(
      {
        message: "Backend unreachable",
        backendUrl: env.backendUrl,
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 }
    )
  }

  const contentType = upstream.headers.get("content-type") ?? ""
  const text = await upstream.text()

  if (contentType.includes("application/json")) {
    return NextResponse.json(text ? (JSON.parse(text) as unknown) : null, {
      status: upstream.status,
    })
  }

  return new NextResponse(text, {
    status: upstream.status,
    headers: { "content-type": contentType || "text/plain; charset=utf-8" },
  })
}

export async function GET(req: Request, ctx: { params: Promise<Params> }) {
  return proxy(req, await ctx.params)
}
export async function POST(req: Request, ctx: { params: Promise<Params> }) {
  return proxy(req, await ctx.params)
}
export async function PATCH(req: Request, ctx: { params: Promise<Params> }) {
  return proxy(req, await ctx.params)
}
export async function DELETE(req: Request, ctx: { params: Promise<Params> }) {
  return proxy(req, await ctx.params)
}

