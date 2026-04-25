export class ApiError extends Error {
  status: number
  data: unknown

  constructor(message: string, opts: { status: number; data: unknown }) {
    super(message)
    this.name = "ApiError"
    this.status = opts.status
    this.data = opts.data
  }
}

function errorMessageFromData(data: unknown) {
  if (!data) return null
  if (typeof data === "string") return data
  if (typeof data === "object") {
    const maybe = data as { message?: unknown; error?: unknown }
    if (typeof maybe.message === "string") return maybe.message
    if (Array.isArray(maybe.message)) return maybe.message.filter((x) => typeof x === "string").join(", ")
    if (typeof maybe.error === "string") return maybe.error
  }
  return null
}

async function parseJsonSafely(res: Response) {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

export async function apiFetch<T>(
  path: string,
  init?: Omit<RequestInit, "headers"> & { headers?: Record<string, string> }
): Promise<T> {
  const headers: Record<string, string> = { ...(init?.headers ?? {}) }
  if (init?.body && !headers["content-type"]) {
    headers["content-type"] = "application/json"
  }

  const res = await fetch(path, {
    ...init,
    headers,
  })

  const data = await parseJsonSafely(res)
  if (!res.ok) {
    const msg = errorMessageFromData(data)
    throw new ApiError(msg ? `API ${res.status}: ${msg}` : `API request failed (${res.status})`, {
      status: res.status,
      data,
    })
  }
  return data as T
}

