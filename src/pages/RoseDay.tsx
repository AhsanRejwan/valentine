import { useRef, useState } from 'react'
import clsx from 'clsx'
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
import { getDayUnlockAt, getNow, isUnlocked } from '../utils/unlock'

interface RoseOption {
  id: 'red' | 'pink' | 'white' | 'blue'
  label: string
  image: string
  rewardText: string
}

const ROSE_OPTIONS: RoseOption[] = [
  {
    id: 'red',
    label: 'Red Rose',
    image: '/assets/rose-day/rose-red.svg',
    rewardText: 'One classic red rose date, chosen by you.',
  },
  {
    id: 'pink',
    label: 'Pink Rose',
    image: '/assets/rose-day/rose-pink.svg',
    rewardText: 'One sweet pink rose date, full of soft romance.',
  },
  {
    id: 'white',
    label: 'White Rose',
    image: '/assets/rose-day/rose-white.svg',
    rewardText: 'One peaceful white rose date with calm cozy vibes.',
  },
  {
    id: 'blue',
    label: 'Blue Rose',
    image: '/assets/rose-day/rose-blue.svg',
    rewardText: 'One dreamy blue rose date, magical and rare.',
  },
]

export default function RoseDay() {
  const [selectedRose, setSelectedRose] = useState<RoseOption | null>(null)
  const [isCouponOpen, setIsCouponOpen] = useState(false)
  const couponRef = useRef<HTMLDivElement>(null)
  const { downloadCoupon, isDownloading, error } = useCouponDownload()
  const location = useLocation()
  const debug = parseDebugConfig(location.search)
  const prefersReducedMotion = useReducedMotionPreference()
  const liveNow = useNow()
  const now = debug.debugDate ? getNow(debug) : liveNow
  const day = getDayById('rose-day')

  if (debug.invalidDayId) {
    return <DebugErrorView invalidDayId={debug.invalidDayId} />
  }

  if (!isUnlocked(day.id, now, debug)) {
    return <LockedView title={day.title} unlockAt={getDayUnlockAt(day.id, now)} backgroundSrc={day.background} />
  }

  return (
    <PageLayout backgroundSrc={day.background} title={day.title} showBackButton onBack={() => window.history.back()}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-6 md:gap-8">
        <section className="dreamy-surface px-6 py-7 text-center md:px-10 md:py-8">
          <img src={day.icon} alt="" aria-hidden className="mx-auto h-14 w-14 object-contain md:h-16 md:w-16" />
          <h2 className="mt-4 text-3xl font-semibold text-rich-brown md:text-4xl">Pick Today&apos;s Rose</h2>
          <p className="mx-auto mt-2 max-w-2xl text-cocoa">
            Choose one rose and I&apos;ll turn it into your Rose Day coupon instantly.
          </p>
        </section>

        <section className="dreamy-surface px-5 py-6 md:px-8 md:py-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {ROSE_OPTIONS.map((rose, index) => {
              const isSelected = selectedRose?.id === rose.id

              return (
                <button
                  key={rose.id}
                  type="button"
                  onClick={() => {
                    setSelectedRose(rose)
                    setIsCouponOpen(true)
                  }}
                  className={clsx(
                    'group relative overflow-hidden rounded-3xl border bg-white/80 p-3 shadow-sticker transition duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soft-rose/80 focus-visible:ring-offset-2',
                    'hover:-translate-y-1 hover:shadow-glow',
                    isSelected ? 'border-soft-rose bg-white shadow-glow' : 'border-white/70',
                    !prefersReducedMotion && 'animate-sway-soft',
                  )}
                  style={!prefersReducedMotion ? { animationDelay: `${index * 0.2}s` } : undefined}
                  aria-label={`Choose ${rose.label}`}
                >
                  <img
                    src="/assets/rose-day/selection-glow.svg"
                    alt=""
                    aria-hidden
                    className={clsx(
                      'pointer-events-none absolute inset-0 h-full w-full object-cover transition',
                      isSelected ? 'opacity-70' : 'opacity-0 group-hover:opacity-45',
                    )}
                  />
                  <img
                    src={rose.image}
                    alt=""
                    aria-hidden
                    className="relative z-10 mx-auto h-28 w-full max-w-[7rem] object-contain md:h-32"
                  />
                  <p className="relative z-10 mt-2 text-sm font-semibold text-rich-brown md:text-base">{rose.label}</p>
                </button>
              )
            })}
          </div>
        </section>

        <div className="flex justify-center">
          <Link to={{ pathname: '/', search: location.search, hash: '#roadmap' }}>
            <Button variant="secondary">Back to Home</Button>
          </Link>
        </div>
      </div>

      <Modal isOpen={isCouponOpen} onClose={() => setIsCouponOpen(false)} title="Rose Day Coupon">
        <div className="space-y-5">
          <div ref={couponRef}>
            <CouponCard
              dayId="rose-day"
              title="Rose Day"
              rewardText={selectedRose?.rewardText ?? 'One dreamy rose date, chosen by you.'}
            />
          </div>

          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsCouponOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                void downloadCoupon(couponRef.current, { dayId: 'rose-day', selection: selectedRose?.id })
                setIsCouponOpen(false)
              }}
              disabled={isDownloading}
            >
              {isDownloading ? 'Preparing Coupon...' : 'Download Coupon'}
            </Button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  )
}
