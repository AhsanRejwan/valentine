import { DAYS_BY_ID } from '../../config/days'
import { formatCountdown } from '../../utils/time'
import type { NextUnlock } from '../../utils/unlock'

interface CountdownPillProps {
  nextUnlock: NextUnlock | null
}

export function CountdownPill({ nextUnlock }: CountdownPillProps) {
  if (!nextUnlock) {
    return (
      <div className="dreamy-surface mx-auto flex w-full max-w-2xl items-center justify-center gap-3 px-5 py-4 text-center">
        <img src="/assets/home/countdown-clock.svg" alt="" aria-hidden className="h-8 w-8 object-contain opacity-70" />
        <p className="text-sm font-semibold text-rich-brown md:text-base">All currently available days are unlocked.</p>
      </div>
    )
  }

  const nextDayTitle = DAYS_BY_ID[nextUnlock.dayId].title

  return (
    <div className="dreamy-surface mx-auto flex w-full max-w-2xl items-center justify-between gap-4 px-5 py-4">
      <div className="flex items-center gap-3">
        <img src="/assets/home/countdown-clock.svg" alt="" aria-hidden className="h-9 w-9 object-contain" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-soft-brown">Next unlock</p>
          <p className="text-sm font-semibold text-rich-brown md:text-base">{nextDayTitle}</p>
        </div>
      </div>
      <p className="text-2xl font-semibold tabular-nums text-rich-brown md:text-3xl">
        {formatCountdown(nextUnlock.msRemaining)}
      </p>
    </div>
  )
}
