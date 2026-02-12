import { addDays } from 'date-fns'
import { DAYS, getDayById, getDayIndex, type DayId } from '../config/days'
import type { DebugConfig } from './debug'

export type DayStatus = 'locked' | 'today' | 'unlocked'

export interface NextUnlock {
  dayId: DayId
  unlockAt: Date
  msRemaining: number
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function isSameLocalDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

function getDebugUnlockIndex(debug: DebugConfig) {
  if (debug.allUnlocked) {
    return DAYS.length - 1
  }

  if (!debug.debugDayId) {
    return null
  }

  return getDayIndex(debug.debugDayId)
}

function isNaturallyUnlocked(dayId: DayId, now: Date) {
  return now >= getDayUnlockAt(dayId, now)
}

export function getStartDate(referenceDate = new Date()) {
  return new Date(referenceDate.getFullYear(), 1, 7, 0, 0, 0, 0)
}

export function getNow(debug: DebugConfig) {
  return debug.debugDate ? new Date(debug.debugDate) : new Date()
}

export function getDayUnlockAt(dayId: DayId, now: Date) {
  const day = getDayById(dayId)
  const startDate = getStartDate(now)
  return addDays(startDate, day.unlockOffsetDays)
}

export function isUnlocked(dayId: DayId, now: Date, debug: DebugConfig) {
  if (debug.invalidDayId) {
    return false
  }

  const debugUnlockIndex = getDebugUnlockIndex(debug)
  if (debugUnlockIndex !== null) {
    return getDayIndex(dayId) <= debugUnlockIndex
  }

  return isNaturallyUnlocked(dayId, now)
}

export function getDayStatus(dayId: DayId, now: Date, debug: DebugConfig): DayStatus {
  if (!isUnlocked(dayId, now, debug)) {
    return 'locked'
  }

  if (debug.debugDayId) {
    return debug.debugDayId === dayId ? 'today' : 'unlocked'
  }

  const unlockAt = getDayUnlockAt(dayId, now)
  const nowDay = startOfLocalDay(now)
  return isSameLocalDay(unlockAt, nowDay) ? 'today' : 'unlocked'
}

export function getNextUnlock(now: Date, debug: DebugConfig): NextUnlock | null {
  if (debug.invalidDayId || debug.allUnlocked || debug.debugDayId) {
    return null
  }

  for (const day of DAYS) {
    if (!isNaturallyUnlocked(day.id, now)) {
      const unlockAt = getDayUnlockAt(day.id, now)
      return {
        dayId: day.id,
        unlockAt,
        msRemaining: Math.max(0, unlockAt.getTime() - now.getTime()),
      }
    }
  }

  return null
}
