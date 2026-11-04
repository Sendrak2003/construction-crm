const formatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatDateTime(value: string) {
  return formatter.format(new Date(value))
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}
