import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { PageLayout } from '../components/layout/PageLayout'
import { LockedView } from '../components/layout/LockedView'
import { DebugErrorView } from '../components/layout/DebugErrorView'
import { Modal } from '../components/layout/Modal'
import { CouponCard } from '../components/coupon/CouponCard'
import { useCouponDownload } from '../components/coupon/useCouponDownload'
import { getDayById } from '../config/days'
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference'
import { useNow } from '../hooks/useNow'
import { parseDebugConfig } from '../utils/debug'
import { formatDateTime } from '../utils/time'
import { getDayUnlockAt, getNow, isUnlocked } from '../utils/unlock'

interface ProposeOption {
  id: 'food' | 'activity' | 'place'
  label: string
  image: string
  hint: string
  rewardText: string
}

const PROPOSE_OPTIONS: ProposeOption[] = [
  {
    id: 'food',
    label: 'Food Date',
    image: '/assets/propose-day/icon-food.svg',
    hint: 'You pick the cravings, I plan the place.',
    rewardText: 'A special proposal plan built around your favorite food.',
  },
  {
    id: 'activity',
    label: 'Activity Date',
    image: '/assets/propose-day/icon-activity.svg',
    hint: 'A playful plan with fun things we both love.',
    rewardText: 'A proposal-style activity date crafted around our vibe.',
  },
  {
    id: 'place',
    label: 'Special Place',
    image: '/assets/propose-day/icon-place.svg',
    hint: 'A meaningful spot where we make a memory.',
    rewardText: 'A proposal-style surprise at a special place picked for us.',
  },
]

export default function ProposeDay() {
  const [selectedOption, setSelectedOption] = useState<ProposeOption | null>(null)
  const [isRingOpen, setIsRingOpen] = useState(false)
  const [ringPulseKey, setRingPulseKey] = useState(0)
  const [isCouponOpen, setIsCouponOpen] = useState(false)
  const couponRef = useRef<HTMLDivElement>(null)
  const openTimerRef = useRef<number | null>(null)
  const { downloadCoupon, isDownloading, error } = useCouponDownload()
  const location = useLocation()
  const debug = parseDebugConfig(location.search)
  const prefersReducedMotion = useReducedMotionPreference()
  const liveNow = useNow()
  const now = debug.debugDate ? getNow(debug) : liveNow
  const day = getDayById('propose-day')

  useEffect(() => {
    return () => {
      if (openTimerRef.current !== null) {
        window.clearTimeout(openTimerRef.current)
      }
    }
  }, [])

  if (debug.invalidDayId) {
    return <DebugErrorView invalidDayId={debug.invalidDayId} />
  }

  if (!isUnlocked(day.id, now, debug)) {
    return <LockedView title={day.title} unlockAt={getDayUnlockAt(day.id, now)} backgroundSrc={day.background} />
  }

  const onSelectOption = (option: ProposeOption) => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current)
      openTimerRef.current = null
    }

    setSelectedOption(option)
    setIsRingOpen(true)
    setRingPulseKey((value) => value + 1)

    if (prefersReducedMotion) {
      setIsCouponOpen(true)
      return
    }

    openTimerRef.current = window.setTimeout(() => {
      setIsCouponOpen(true)
      openTimerRef.current = null
    }, 540)
  }

  return (
    <PageLayout backgroundSrc={day.background} title={day.title} showBackButton onBack={() => window.history.back()}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-6 md:gap-8">
        <section className="dreamy-surface px-6 py-7 text-center md:px-10 md:py-8">
          <img src={day.icon} alt="" aria-hidden className="mx-auto h-14 w-14 object-contain md:h-16 md:w-16" />
          <h2 className="mt-4 text-3xl font-semibold text-rich-brown md:text-4xl">How Should I Propose The Date?</h2>
          <p className="mx-auto mt-2 max-w-2xl text-cocoa">Choose the vibe. The ring opens, and your coupon appears.</p>
          <p className="mt-3 text-sm text-soft-brown">Scheduled unlock: {formatDateTime(getDayUnlockAt(day.id, now))}</p>
        </section>

        <section className="dreamy-surface px-5 py-6 md:px-8 md:py-8">
          <div className="grid gap-4 md:grid-cols-3">
            {PROPOSE_OPTIONS.map((option) => {
              const isSelected = selectedOption?.id === option.id

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onSelectOption(option)}
                  className={clsx(
                    'rounded-3xl border bg-white/80 px-4 py-5 text-center shadow-sticker transition duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soft-rose/80 focus-visible:ring-offset-2',
                    'hover:-translate-y-1 hover:shadow-glow',
                    isSelected ? 'border-soft-rose bg-white shadow-glow' : 'border-white/70',
                  )}
                >
                  <img src={option.image} alt="" aria-hidden className="mx-auto h-14 w-14 object-contain md:h-16 md:w-16" />
                  <p className="mt-3 text-base font-semibold text-rich-brown">{option.label}</p>
                  <p className="mt-1 text-sm text-cocoa">{option.hint}</p>
                </button>
              )
            })}
          </div>

          <div className="mt-7 flex justify-center">
            <motion.img
              key={`${isRingOpen ? 'open' : 'closed'}-${ringPulseKey}`}
              src={isRingOpen ? '/assets/propose-day/ring-box-open.svg' : '/assets/propose-day/ring-box.svg'}
              alt={isRingOpen ? 'Opened ring box' : 'Closed ring box'}
              className="h-40 w-auto max-w-full object-contain md:h-48"
              initial={prefersReducedMotion ? false : { scale: 0.86, y: 10, opacity: 0.82 }}
              animate={prefersReducedMotion ? { scale: 1, y: 0, opacity: 1 } : { scale: 1, y: 0, opacity: 1 }}
              transition={{ duration: prefersReducedMotion ? 0.05 : 0.42, ease: 'easeOut' }}
            />
          </div>
        </section>

        <div className="flex justify-center">
          <Link to={`/${location.search}`}>
            <Button variant="secondary">Back to Home</Button>
          </Link>
        </div>
      </div>

      <Modal isOpen={isCouponOpen} onClose={() => setIsCouponOpen(false)} title="Propose Day Coupon">
        <div className="space-y-5">
          <div ref={couponRef}>
            <CouponCard
              dayId="propose-day"
              title="Propose Day"
              rewardText={selectedOption?.rewardText ?? 'A special proposal plan crafted around your vibe.'}
            />
          </div>

          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsCouponOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                void downloadCoupon(couponRef.current, { dayId: 'propose-day', selection: selectedOption?.id })
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
