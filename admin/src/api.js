const apiBase = import.meta.env.VITE_API_BASE_URL ?? '/api'

export async function apiRequest(path, { method = 'GET', body } = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    method,
    credentials: 'include',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (response.status === 204) return null

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    if (response.status === 401 && path !== '/auth/login') {
      window.dispatchEvent(new Event('admin-session-expired'))
    }
    const detail = Array.isArray(data?.details)
      ? data.details.map((item) => item.message).filter(Boolean).join(' ')
      : ''
    throw new Error(detail || data?.error || `Request failed (${response.status})`)
  }
  return data
}

export function encodeQuery(values) {
  const query = new URLSearchParams()
  Object.entries(values).forEach(([key, value]) => {
    if (value) query.set(key, value)
  })
  const text = query.toString()
  return text ? `?${text}` : ''
}
