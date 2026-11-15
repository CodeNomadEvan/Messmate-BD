function pad(value) {
  return String(value).padStart(2, '0')
}

export function toISO(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function parseISO(value) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatDate(value, withYear = false) {
  if (!value) return '—'
  return parseISO(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    ...(withYear ? { year: 'numeric' } : {}),
  })
}

export function formatLongDate(value) {
  return parseISO(value).toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function monthLabel(date = new Date()) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function monthStart(date = new Date()) {
  return toISO(new Date(date.getFullYear(), date.getMonth(), 1))
}

export function monthEnd(date = new Date()) {
  return toISO(new Date(date.getFullYear(), date.getMonth() + 1, 0))
}

export function dateRange(start, end) {
  const dates = []
  const cursor = parseISO(start)
  const last = parseISO(end)

  while (cursor <= last) {
    dates.push(toISO(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }

  return dates
}

export function timeToMinutes(value) {
  if (!value) return null
  const [hour, minute] = value.split(':').map(Number)
  return hour * 60 + minute
}

export function currentMinutes() {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

export function formatTime(value) {
  if (!value) return 'Not set'
  const [hour, minute] = value.split(':').map(Number)
  const date = new Date(2000, 0, 1, hour, minute)
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}
