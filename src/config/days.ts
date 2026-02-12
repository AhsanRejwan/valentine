export type DayId =
  | 'rose-day'
  | 'propose-day'
  | 'chocolate-day'
  | 'teddy-day'
  | 'promise-day'
  | 'hug-day'
  | 'kiss-day'
  | 'valentines-day'

export interface DayConfig {
  id: DayId
  title: string
  route: string
  icon: string
  background: string
  unlockOffsetDays: number
}

export const DAYS: DayConfig[] = [
  {
    id: 'rose-day',
    title: 'Rose Day',
    route: '/rose-day',
    icon: '/assets/icons/rose.svg',
    background: '/assets/rose-day/bg-rose-field.svg',
    unlockOffsetDays: 0,
  },
  {
    id: 'propose-day',
    title: 'Propose Day',
    route: '/propose-day',
    icon: '/assets/icons/ring.svg',
    background: '/assets/propose-day/bg-day-date.svg',
    unlockOffsetDays: 1,
  },
  {
    id: 'chocolate-day',
    title: 'Chocolate Day',
    route: '/chocolate-day',
    icon: '/assets/icons/chocolate.svg',
    background: '/assets/chocolate-day/bg-choco.svg',
    unlockOffsetDays: 2,
  },
  {
    id: 'teddy-day',
    title: 'Teddy Day',
    route: '/teddy-day',
    icon: '/assets/icons/teddy.svg',
    background: '/assets/teddy-day/bg-teddy.svg',
    unlockOffsetDays: 3,
  },
  {
    id: 'promise-day',
    title: 'Promise Day',
    route: '/promise-day',
    icon: '/assets/icons/promise-scroll.svg',
    background: '/assets/promise-day/bg-promise.svg',
    unlockOffsetDays: 4,
  },
  {
    id: 'hug-day',
    title: 'Hug Day',
    route: '/hug-day',
    icon: '/assets/icons/hug.svg',
    background: '/assets/hug-day/bg-hug.svg',
    unlockOffsetDays: 5,
  },
  {
    id: 'kiss-day',
    title: 'Kiss Day',
    route: '/kiss-day',
    icon: '/assets/icons/kiss.svg',
    background: '/assets/kiss-day/bg-kiss.svg',
    unlockOffsetDays: 6,
  },
  {
    id: 'valentines-day',
    title: "Valentine's Day",
    route: '/valentines-day',
    icon: '/assets/icons/valentine-heart.svg',
    background: '/assets/valentines-day/bg-valentine.svg',
    unlockOffsetDays: 7,
  },
]

export const DAY_IDS = DAYS.map((day) => day.id)

export const DAYS_BY_ID: Record<DayId, DayConfig> = DAYS.reduce(
  (accumulator, day) => {
    accumulator[day.id] = day
    return accumulator
  },
  {} as Record<DayId, DayConfig>,
)

export function getDayById(dayId: DayId) {
  return DAYS_BY_ID[dayId]
}

export function getDayIndex(dayId: DayId) {
  return DAYS.findIndex((day) => day.id === dayId)
}
