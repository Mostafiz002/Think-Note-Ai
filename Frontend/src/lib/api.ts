import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios"

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

const api = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
})

// Flag to prevent infinite refresh loops
let isRefreshing = false

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.startsWith("/api/auth/")
    ) {
      if (isRefreshing) return Promise.reject(error)
      
      isRefreshing = true
      originalRequest._retry = true

      try {
        await axios.post("/api/auth/refresh-token")
        isRefreshing = false
        return api(originalRequest)
      } catch (refreshError) {
        isRefreshing = false
      }
    }

    if (error.response) {
      const data = error.response.data
      const msg = errorMessageFromData(data)
      const apiErr = new ApiError(msg ? `API ${error.response.status}: ${msg}` : `API request failed (${error.response.status})`, {
        status: error.response.status,
        data,
      })
      return Promise.reject(apiErr)
    }

    return Promise.reject(error)
  }
)

export async function apiFetch<T>(
  path: string,
  init?: { method?: string; body?: any; headers?: Record<string, string>; cache?: string }
): Promise<T> {
  const response = await api.request<T>({
    url: path,
    method: init?.method || "GET",
    data: init?.body,
    headers: init?.headers,
  })
  
  return response.data
}

