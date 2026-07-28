// Defaults to the local dev backend. In container mode (nginx proxying /api),
// this is set to '' at build time so requests resolve as same-origin relative paths.
const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:9090'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function fetchJson<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const query = new URLSearchParams()
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === '') {
        continue
      }
      if (Array.isArray(value)) {
        for (const item of value) {
          query.append(key, String(item))
        }
      } else {
        query.set(key, String(value))
      }
    }
  }
  const queryString = query.toString()
  const url = `${API_BASE_URL}${path}${queryString ? `?${queryString}` : ''}`

  const response = await fetch(url)
  if (!response.ok) {
    throw new ApiError(response.status, `Request to ${path} failed with status ${response.status}`)
  }
  return (await response.json()) as T
}
