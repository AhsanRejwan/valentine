import { Link } from 'react-router-dom'
import { DAYS } from '../../config/days'
import type { DebugConfig } from '../../utils/debug'
import { getDayStatus, type DayStatus } from '../../utils/unlock'

interface RoadmapProps {
  now: Date
  debug: DebugConfig
  query: string
}

function getStatusStyles(status: DayStatus) {
  if (status === 'today') {
    return 'border-soft-gold bg-soft-gold/40 text-rich-brown'
  }

  if (status === 'unlocked') {
    return 'border-soft-green bg-soft-green/45 text-rich-brown'
  }

  return 'border-white/60 bg-white/60 text-soft-brown'
}

export function Roadmap({ now, debug, query }: RoadmapProps) {
  return (
    <section id="roadmap" className="dreamy-surface relative mx-auto w-full max-w-5xl overflow-hidden px-4 py-6 md:px-6 md:py-7">
      <div className="relative z-10">
        <h3 className="text-center text-2xl font-semibold text-rich-brown md:text-3xl">Valentine Week Roadmap</h3>
        <p className="mt-1 text-center text-sm text-cocoa">Unlocks automatically at local midnight.</p>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {DAYS.map((day) => {
            const status = getDayStatus(day.id, now, debug)

            return (
              <Link
                key={day.id}
                to={`${day.route}${query}`}
                className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-dreamy transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soft-rose/80 focus-visible:ring-offset-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={day.icon} alt="" aria-hidden className="h-8 w-8 object-contain" />
                    <div>
                      <p className="text-sm font-semibold text-rich-brown">{day.title}</p>
                      <p className="text-xs text-soft-brown">{day.subtitle}</p>
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
    </section>
  )
}
