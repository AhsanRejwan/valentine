import { DAY_IDS, type DayId } from '../config/days'

export interface DebugConfig {
  allUnlocked: boolean
  debugDayId?: DayId
  debugDate?: Date
  invalidDayId?: string
}

const DEBUG_ALL_PARAM = 'debugAll'
const DEBUG_DAY_PARAM = 'debugDay'
const DEBUG_DATE_PARAM = 'debugDate'

function parseDebugDate(rawDate: string | null) {
  if (!rawDate) {
    return undefined
  }

  const match = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) {
    return undefined
  }

  const [, yearText, monthText, dayText] = match
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)

  const parsed = new Date(year, month - 1, day)
  const isValid =
    parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day

  return isValid ? parsed : undefined
}

export function parseDebugConfig(search: string): DebugConfig {
  const params = new URLSearchParams(search)

  const allUnlocked = params.get(DEBUG_ALL_PARAM) === '1'
  const dayValue = params.get(DEBUG_DAY_PARAM)?.trim()
  const debugDate = parseDebugDate(params.get(DEBUG_DATE_PARAM))

  if (!dayValue) {
    return { allUnlocked, debugDate }
  }

  if (!DAY_IDS.includes(dayValue as DayId)) {
    return {
      allUnlocked,
      debugDate,
      invalidDayId: dayValue,
    }
  }

  return {
    allUnlocked,
    debugDate,
    debugDayId: dayValue as DayId,
  }
}
