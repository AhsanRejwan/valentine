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
import { getDayUnlockAt, getNow, isUnlocked } from '../utils/unlock'

const HEART_BURST_DURATION_MS = 1900
const COUPON_OPEN_DELAY_MS = 1200
const DEFAULT_REWARD_TEXT = 'A sweet kiss voucher redeemable on demand.'
const HEART_PARTICLES = [
  { x: -88, y: -150, size: 16, duration: 1.35, delay: 0 },
  { x: -58, y: -182, size: 20, duration: 1.55, delay: 0.08 },
  { x: -24, y: -210, size: 18, duration: 1.75, delay: 0.16 },
  { x: 0, y: -220, size: 24, duration: 1.9, delay: 0.06 },
  { x: 26, y: -206, size: 18, duration: 1.7, delay: 0.12 },
  { x: 60, y: -180, size: 20, duration: 1.55, delay: 0.04 },
  { x: 92, y: -148, size: 16, duration: 1.35, delay: 0.14 },
] as const

export default function KissDay() {
  const [hasKissed, setHasKissed] = useState(false)
  const [showHearts, setShowHearts] = useState(false)
  const [isCouponOpen, setIsCouponOpen] = useState(false)
  const [burstKey, setBurstKey] = useState(0)
  const couponRef = useRef<HTMLDivElement>(null)
  const heartsTimerRef = useRef<number | null>(null)
  const couponTimerRef = useRef<number | null>(null)
  const { downloadCoupon, isDownloading, error } = useCouponDownload()
  const location = useLocation()
  const debug = parseDebugConfig(location.search)
  const prefersReducedMotion = useReducedMotionPreference()
  const liveNow = useNow()
  const now = debug.debugDate ? getNow(debug) : liveNow
  const day = getDayById('kiss-day')

  useEffect(() => {
    return () => {
      if (heartsTimerRef.current !== null) {
        window.clearTimeout(heartsTimerRef.current)
      }
      if (couponTimerRef.current !== null) {
        window.clearTimeout(couponTimerRef.current)
      }
    }
  }, [])

  if (debug.invalidDayId) {
    return <DebugErrorView invalidDayId={debug.invalidDayId} />
  }

  if (!isUnlocked(day.id, now, debug)) {
    return <LockedView title={day.title} unlockAt={getDayUnlockAt(day.id, now)} backgroundSrc={day.background} />
  }

  const clearTimers = () => {
    if (heartsTimerRef.current !== null) {
      window.clearTimeout(heartsTimerRef.current)
      heartsTimerRef.current = null
    }
    if (couponTimerRef.current !== null) {
      window.clearTimeout(couponTimerRef.current)
      couponTimerRef.current = null
    }
  }

  const triggerKiss = () => {
    if (couponTimerRef.current !== null || isCouponOpen) {
      return
    }

    clearTimers()
    setHasKissed(true)

    if (prefersReducedMotion) {
      setShowHearts(false)
      setIsCouponOpen(true)
      return
    }

    setBurstKey((value) => value + 1)
    setShowHearts(true)

    heartsTimerRef.current = window.setTimeout(() => {
      setShowHearts(false)
      heartsTimerRef.current = null
    }, HEART_BURST_DURATION_MS)

    couponTimerRef.current = window.setTimeout(() => {
      setIsCouponOpen(true)
      couponTimerRef.current = null
    }, COUPON_OPEN_DELAY_MS)
  }

  const resetKiss = () => {
    clearTimers()
    setHasKissed(false)
    setShowHearts(false)
    setIsCouponOpen(false)
    setBurstKey(0)
  }

  return (
    <PageLayout backgroundSrc={day.background} title={day.title} showBackButton onBack={() => window.history.back()}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-6 md:gap-8">
        <section className="dreamy-surface px-6 py-7 text-center md:px-10 md:py-8">
          <img src={day.icon} alt="" aria-hidden className="mx-auto h-14 w-14 object-contain md:h-16 md:w-16" />
          <h2 className="mt-4 text-3xl font-semibold text-rich-brown md:text-4xl">Send Me A Kiss</h2>
          <p className="mx-auto mt-2 max-w-2xl text-cocoa">
            Tap the kiss mark and watch the love float up before your coupon appears.
          </p>
        </section>

        <section className="px-1 py-1 md:px-2 md:py-2">
          <div className="mx-auto w-full max-w-4xl">
            <div className="relative flex min-h-[19rem] items-center justify-center">
              <div className="relative">
                {showHearts ? (
                  <div key={burstKey} className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-0 w-0">
                    {HEART_PARTICLES.map((particle, index) => (
                      <motion.img
                        key={`${burstKey}-${index}`}
                        src="/assets/ui/heart-small.svg"
                        alt=""
                        aria-hidden
                        className="absolute left-0 top-0 object-contain"
                        style={{ width: particle.size, height: particle.size }}
                        initial={{ opacity: 0, x: 0, y: 12, scale: 0.8 }}
                        animate={{ opacity: [0, 1, 0.75, 0], x: particle.x, y: particle.y, scale: [0.8, 1.12, 1] }}
                        transition={{ duration: particle.duration, ease: 'easeOut', delay: particle.delay }}
                      />
                    ))}
                  </div>
                ) : null}

                <motion.button
                  type="button"
                  onClick={triggerKiss}
                  disabled={isCouponOpen}
                  className={clsx(
                    'relative z-10 rounded-full border border-white/70 bg-white/88 p-5 shadow-sticker transition',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soft-rose/80 focus-visible:ring-offset-2',
                    isCouponOpen ? 'cursor-default opacity-75' : 'cursor-pointer hover:shadow-glow',
                  )}
                  whileTap={isCouponOpen ? undefined : { scale: 0.94 }}
                  whileHover={isCouponOpen ? undefined : { scale: 1.03 }}
                  animate={
                    prefersReducedMotion || isCouponOpen
                      ? { scale: 1, rotate: 0 }
                      : { scale: [1, 1.03, 1], rotate: [0, -1.2, 1, 0] }
                  }
                  transition={
                    prefersReducedMotion || isCouponOpen
                      ? { duration: 0.05 }
                      : { duration: 3.6, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }
                  }
                  aria-label="Send virtual kiss"
                >
                  <img src="/assets/kiss-day/kiss-mark.svg" alt="" aria-hidden className="h-28 w-28 object-contain md:h-32 md:w-32" />
                </motion.button>
              </div>
            </div>

            <div className="mx-auto mt-3 w-full max-w-xl px-4 text-center">
              <p className="rounded-full border border-white/60 bg-white/75 px-4 py-2 text-sm font-semibold text-rich-brown shadow-dreamy">
                {hasKissed ? 'That kiss was received.' : 'Tap once to send your virtual kiss.'}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button variant="secondary" onClick={resetKiss}>
                Reset Kiss
              </Button>
              <Link to={{ pathname: '/', search: location.search, hash: '#roadmap' }}>
                <Button variant="secondary">Back to Home</Button>
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Modal isOpen={isCouponOpen} onClose={() => setIsCouponOpen(false)} title="Kiss Day Coupon">
        <div className="space-y-5">
          <div ref={couponRef}>
            <CouponCard dayId="kiss-day" title="Kiss Day" rewardText={DEFAULT_REWARD_TEXT} />
          </div>

          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsCouponOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                void downloadCoupon(couponRef.current, { dayId: 'kiss-day' })
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
