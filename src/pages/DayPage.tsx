import { Link, useLocation } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { PageLayout } from '../components/layout/PageLayout'
import { LockedView } from '../components/layout/LockedView'
import { DebugErrorView } from '../components/layout/DebugErrorView'
import { getDayById, type DayId } from '../config/days'
import { parseDebugConfig } from '../utils/debug'
import { getDayUnlockAt, getNow, isUnlocked } from '../utils/unlock'
import { formatDateTime } from '../utils/time'
import { useNow } from '../hooks/useNow'

interface DayPageProps {
  dayId: DayId
}

export function DayPage({ dayId }: DayPageProps) {
  const location = useLocation()
  const debug = parseDebugConfig(location.search)
  const day = getDayById(dayId)
  const liveNow = useNow()
  const now = debug.debugDate ? getNow(debug) : liveNow

  if (debug.invalidDayId) {
    return <DebugErrorView invalidDayId={debug.invalidDayId} />
  }

  if (!isUnlocked(dayId, now, debug)) {
    return <LockedView title={day.title} unlockAt={getDayUnlockAt(dayId, now)} backgroundSrc={day.background} />
  }

  return (
    <PageLayout backgroundSrc={day.background} title={day.title} showBackButton onBack={() => window.history.back()}>
      <div className="dreamy-surface w-full max-w-2xl p-6 text-center md:p-10">
        <img src={day.icon} alt="" aria-hidden className="mx-auto h-16 w-16 object-contain md:h-20 md:w-20" />
        <h2 className="mt-4 text-3xl font-semibold text-rich-brown">{day.title}</h2>
        <p className="mt-2 text-cocoa">This day route is unlocked. Interaction UI will be implemented in later phases.</p>
        <p className="mt-3 text-sm text-soft-brown">Scheduled unlock: {formatDateTime(getDayUnlockAt(dayId, now))}</p>

        <div className="mt-7">
          <Link to={`/${location.search}`}>
            <Button variant="secondary">Back to Home</Button>
          </Link>
        </div>
      </div>
    </PageLayout>
  )
}
