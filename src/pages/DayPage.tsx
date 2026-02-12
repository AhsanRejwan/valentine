import { useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { PageLayout } from '../components/layout/PageLayout'
import { LockedView } from '../components/layout/LockedView'
import { DebugErrorView } from '../components/layout/DebugErrorView'
import { Modal } from '../components/layout/Modal'
import { CouponCard } from '../components/coupon/CouponCard'
import { useCouponDownload } from '../components/coupon/useCouponDownload'
import { getDayById, type DayId } from '../config/days'
import { parseDebugConfig } from '../utils/debug'
import { getDayUnlockAt, getNow, isUnlocked } from '../utils/unlock'
import { formatDateTime } from '../utils/time'
import { useNow } from '../hooks/useNow'

interface DayPageProps {
  dayId: DayId
}

const DAY_REWARDS: Record<DayId, string> = {
  'rose-day': 'One dreamy rose date, chosen by you.',
  'propose-day': 'A special proposal plan crafted around your vibe.',
  'chocolate-day': 'A hand-picked chocolate box waiting for our date.',
  'teddy-day': 'A teddy hug session with your favorite accessories.',
  'promise-day': 'A heartfelt promise card, sealed just for you.',
  'hug-day': 'A long warm hug with no timer in real life.',
  'kiss-day': 'A sweet kiss voucher redeemable on demand.',
  'valentines-day': 'The grand finale date with your forever yes.',
}

export function DayPage({ dayId }: DayPageProps) {
  const [isCouponOpen, setIsCouponOpen] = useState(false)
  const couponRef = useRef<HTMLDivElement>(null)
  const { downloadCoupon, isDownloading, error } = useCouponDownload()
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

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => setIsCouponOpen(true)}>Preview Coupon</Button>
          <Link to={`/${location.search}`}>
            <Button variant="secondary">Back to Home</Button>
          </Link>
        </div>
      </div>

      <Modal isOpen={isCouponOpen} onClose={() => setIsCouponOpen(false)} title={`${day.title} Coupon`}>
        <div className="space-y-5">
          <div ref={couponRef}>
            <CouponCard dayId={dayId} title={day.title} rewardText={DAY_REWARDS[dayId]} />
          </div>

          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsCouponOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                void downloadCoupon(couponRef.current, { dayId })
              }}
              disabled={isDownloading}
            >
              {isDownloading ? 'Preparing PNG...' : 'Download PNG'}
            </Button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  )
}
