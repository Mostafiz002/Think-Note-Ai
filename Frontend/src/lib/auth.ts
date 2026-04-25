export const AUTH_COOKIE_NAME = "tn_access_token"
export const REFRESH_COOKIE_NAME = "tn_refresh_token"

export function bearerFromToken(token: string) {
  return `Bearer ${token}`
}

