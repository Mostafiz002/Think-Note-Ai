import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios"

// ─── Error shape from backend ──────────────────────────────────────────────
export interface ApiErrorData {
  statusCode: number
  error: string     // e.g. "Unauthorized", "Not Found"
  message: string   // human-readable description
  path?: string
  timestamp?: string
}

// ─── Typed API error class ─────────────────────────────────────────────────
export class ApiError extends Error {
  status: number
  error: string
  data: ApiErrorData | unknown

  constructor(message: string, opts: { status: number; error: string; data: ApiErrorData | unknown }) {
    super(message)
    this.name = "ApiError"
    this.status = opts.status
    this.error = opts.error
    this.data = opts.data
  }
}

// ─── Extract a clean message from any error response ──────────────────────
function extractMessage(data: unknown): { message: string; error: string } {
  if (!data) return { message: "An unexpected error occurred.", error: "Error" }

  if (typeof data === "object" && data !== null) {
    const d = data as ApiErrorData
    const message = Array.isArray(d.message)
      ? (d.message as string[]).join(", ")
      : d.message ?? "An unexpected error occurred."
    return { message, error: d.error ?? "Error" }
  }

  if (typeof data === "string") return { message: data, error: "Error" }

  return { message: "An unexpected error occurred.", error: "Error" }
}

// ─── Axios instance ────────────────────────────────────────────────────────
const api = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
})

let isRefreshing = false

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // Attempt a token refresh on 401 (except for auth routes)
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
      } catch {
        isRefreshing = false
      }
    }

    if (error.response) {
      const { message, error: errorLabel } = extractMessage(error.response.data)

      return Promise.reject(
        new ApiError(message, {
          status: error.response.status,
          error: errorLabel,
          data: error.response.data,
        })
      )
    }

    // Network / timeout errors
    if (error.request) {
      return Promise.reject(
        new ApiError("Network error. Please check your connection.", {
          status: 0,
          error: "Network Error",
          data: null,
        })
      )
    }

    return Promise.reject(error)
  }
)

// ─── Generic fetch helper ──────────────────────────────────────────────────
export async function apiFetch<T>(
  path: string,
  init?: {
    method?: string
    body?: unknown
    headers?: Record<string, string>
  }
): Promise<T> {
  const isFormData = init?.body instanceof FormData
  
  const response = await api.request<T>({
    url: path,
    method: init?.method ?? "GET",
    data: init?.body,
    headers: {
      ...init?.headers,
      ...(isFormData ? { "Content-Type": undefined } : { "Content-Type": "application/json" }),
    },
  })

  return response.data
}

export default api
