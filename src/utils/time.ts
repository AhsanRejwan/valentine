import { format } from 'date-fns'

function pad(value: number) {
  return value.toString().padStart(2, '0')
}

export function formatCountdown(msRemaining: number) {
  const clamped = Math.max(0, msRemaining)
  const totalSeconds = Math.floor(clamped / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

export function formatDateTime(date: Date) {
  return format(date, 'MMMM d, yyyy HH:mm')
}
