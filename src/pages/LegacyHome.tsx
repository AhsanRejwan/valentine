import { Link, useLocation } from 'react-router-dom'
import { DAYS } from '../config/days'
import { PageLayout } from '../components/layout/PageLayout'
import { DebugErrorView } from '../components/layout/DebugErrorView'
import { parseDebugConfig } from '../utils/debug'
import { getDayStatus, getNextUnlock, getNow, type DayStatus } from '../utils/unlock'
import { formatCountdown } from '../utils/time'
import { useNow } from '../hooks/useNow'

function getStatusStyles(status: DayStatus) {
  if (status === 'today') {
    return 'border-soft-gold bg-soft-gold/40 text-rich-brown'
  }

  if (status === 'unlocked') {
    return 'border-soft-green bg-soft-green/45 text-rich-brown'
  }

  return 'border-white/60 bg-white/60 text-soft-brown'
}

export default function LegacyHome() {
  const location = useLocation()
  const debug = parseDebugConfig(location.search)
  const liveNow = useNow()
  const now = debug.debugDate ? getNow(debug) : liveNow

  if (debug.invalidDayId) {
    return <DebugErrorView invalidDayId={debug.invalidDayId} />
  }

  const nextUnlock = getNextUnlock(now, debug)

  return (
    <PageLayout
      backgroundSrc="/assets/backgrounds/global-dreamy-gradient.svg"
      title="Valentine Week"
      showBackButton={false}
    >
      <div className="dreamy-surface w-full max-w-4xl p-6 md:p-10">
        <h2 className="text-center text-3xl font-semibold text-rich-brown md:text-4xl">Phase 3 Home Placeholder</h2>
        <p className="mt-3 text-center text-cocoa">Routing and unlock states are now active for every day.</p>

        {nextUnlock ? (
          <div className="mt-6 rounded-2xl border border-white/55 bg-white/60 p-4 text-center">
            <p className="text-sm uppercase tracking-wide text-soft-brown">Next unlock in</p>
            <p className="mt-1 text-2xl font-semibold text-rich-brown">
              {formatCountdown(nextUnlock.msRemaining)}
            </p>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-soft-green/60 bg-soft-green/40 p-4 text-center text-rich-brown">
            No upcoming unlocks in current mode.
          </div>
        )}

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {DAYS.map((day) => {
            const status = getDayStatus(day.id, now, debug)

            return (
              <Link
                key={day.id}
                to={`${day.route}${location.search}`}
                className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-dreamy transition hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={day.icon} alt="" aria-hidden className="h-8 w-8 object-contain" />
                    <div>
                      <p className="text-sm font-semibold text-rich-brown">{day.title}</p>
                      <p className="text-xs text-soft-brown">{day.id}</p>
                    </div>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyles(status)}`}>
                    {status}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </PageLayout>
  )
}
