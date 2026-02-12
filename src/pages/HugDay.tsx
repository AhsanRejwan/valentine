import { useEffect, useMemo, useRef, useState } from 'react'
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

interface HugOption {
  id: 'cozy' | 'bear' | 'gentle' | 'sensual' | 'snug'
  label: string
  image: string
  rewardText: string
}

interface FloatingPlacement {
  top: number
  left: number
  rotate: number
  scale: number
}

type FloatingLayout = Record<HugOption['id'], FloatingPlacement>

const HUG_OPTIONS: HugOption[] = [
  {
    id: 'cozy',
    label: 'Cozy Hug',
    image: '/assets/hug-day/icon-cozy-hug.svg',
    rewardText: 'A cozy hug voucher with warm cuddles and no rush.',
  },
  {
    id: 'bear',
    label: 'Bear Hug',
    image: '/assets/hug-day/icon-bear-hug.svg',
    rewardText: 'A giant bear hug voucher strong enough to fix any bad day.',
  },
  {
    id: 'gentle',
    label: 'Gentle Hug',
    image: '/assets/hug-day/icon-gentle-hug.svg',
    rewardText: 'A soft gentle hug voucher for calm, comfort, and peace.',
  },
  {
    id: 'sensual',
    label: 'Sensual Hug',
    image: '/assets/hug-day/icon-sensual-hug.svg',
    rewardText: 'A slow sensual hug voucher reserved for just us two.',
  },
  {
    id: 'snug',
    label: 'Snug Hug',
    image: '/assets/hug-day/icon-snug-hug.svg',
    rewardText: 'A snug hug voucher where I hold you close and never rush away.',
  },
]

const FLOATING_LAYOUTS: readonly FloatingLayout[] = [
  {
    cozy: { top: 10, left: 17, rotate: -10, scale: 1.02 },
    gentle: { top: 89, left: 50, rotate: 7, scale: 1.01 },
    bear: { top: 12, left: 83, rotate: -8, scale: 1.01 },
    sensual: { top: 89, left: 24, rotate: 8, scale: 1.02 },
    snug: { top: 8, left: 50, rotate: -7, scale: 1.01 },
  },
  {
    cozy: { top: 11, left: 16, rotate: 8, scale: 1.01 },
    gentle: { top: 88, left: 50, rotate: -9, scale: 1.02 },
    bear: { top: 10, left: 84, rotate: 7, scale: 0.99 },
    sensual: { top: 88, left: 76, rotate: -8, scale: 1.03 },
    snug: { top: 9, left: 50, rotate: 9, scale: 1.01 },
  },
  {
    cozy: { top: 12, left: 18, rotate: -8, scale: 1.01 },
    gentle: { top: 90, left: 50, rotate: 7, scale: 1.03 },
    bear: { top: 12, left: 82, rotate: -9, scale: 1.02 },
    sensual: { top: 90, left: 72, rotate: 10, scale: 1 },
    snug: { top: 8, left: 50, rotate: -8, scale: 1.02 },
  },
] as const

const HOLD_DURATION_MS = 1600
const COUPON_REVEAL_DELAY_MS = 540
const BURST_DURATION_MS = 2100

function buildFloatingHugOptions() {
  const pickedLayout = FLOATING_LAYOUTS[Math.floor(Math.random() * FLOATING_LAYOUTS.length)]

  return HUG_OPTIONS.map((option) => ({
    ...option,
    ...pickedLayout[option.id],
  }))
}

interface HugMeterProps {
  progress: number
}

function HugMeter({ progress }: HugMeterProps) {
  const safeProgress = Math.min(100, Math.max(0, progress))
  const revealFromTop = 100 - safeProgress

  return (
    <div className="relative mx-auto h-[7.4rem] w-[9.7rem]">
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          clipPath: `inset(0 0 ${safeProgress}% 0)`,
        }}
      >
        <img
          src="/assets/hug-day/hug-meter-heart-empty.svg"
          alt=""
          aria-hidden
          className="h-full w-full object-contain"
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          clipPath: `inset(${revealFromTop}% 0 0 0)`,
        }}
      >
        <img
          src="/assets/hug-day/hug-meter-heart-fill.svg"
          alt=""
          aria-hidden
          className="h-full w-full object-contain"
        />
      </div>
    </div>
  )
}

export default function HugDay() {
  const [selectedHugId, setSelectedHugId] = useState<HugOption['id'] | null>(null)
  const [holdProgress, setHoldProgress] = useState(0)
  const [isHolding, setIsHolding] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isCouponOpen, setIsCouponOpen] = useState(false)
  const [showBurst, setShowBurst] = useState(false)
  const couponRef = useRef<HTMLDivElement>(null)
  const holdAnimationRef = useRef<number | null>(null)
  const holdStartedAtRef = useRef<number | null>(null)
  const couponTimerRef = useRef<number | null>(null)
  const burstTimerRef = useRef<number | null>(null)
  const { downloadCoupon, isDownloading, error } = useCouponDownload()
  const location = useLocation()
  const debug = parseDebugConfig(location.search)
  const prefersReducedMotion = useReducedMotionPreference()
  const liveNow = useNow()
  const now = debug.debugDate ? getNow(debug) : liveNow
  const day = getDayById('hug-day')
  const floatingOptions = useMemo(buildFloatingHugOptions, [])

  const selectedHug = selectedHugId ? HUG_OPTIONS.find((option) => option.id === selectedHugId) ?? null : null
  const rewardText = selectedHug?.rewardText ?? 'A long warm hug with no timer in real life.'

  useEffect(() => {
    return () => {
      if (holdAnimationRef.current !== null) {
        cancelAnimationFrame(holdAnimationRef.current)
      }

      if (couponTimerRef.current !== null) {
        window.clearTimeout(couponTimerRef.current)
      }

      if (burstTimerRef.current !== null) {
        window.clearTimeout(burstTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const handleWindowBlur = () => {
      if (!isComplete) {
        if (holdAnimationRef.current !== null) {
          cancelAnimationFrame(holdAnimationRef.current)
          holdAnimationRef.current = null
        }
        holdStartedAtRef.current = null
        setIsHolding(false)
        setHoldProgress(0)
      }
    }

    window.addEventListener('blur', handleWindowBlur)
    return () => window.removeEventListener('blur', handleWindowBlur)
  }, [isComplete])

  if (debug.invalidDayId) {
    return <DebugErrorView invalidDayId={debug.invalidDayId} />
  }

  if (!isUnlocked(day.id, now, debug)) {
    return <LockedView title={day.title} unlockAt={getDayUnlockAt(day.id, now)} backgroundSrc={day.background} />
  }

  const clearHoldAnimation = () => {
    if (holdAnimationRef.current !== null) {
      cancelAnimationFrame(holdAnimationRef.current)
      holdAnimationRef.current = null
    }
    holdStartedAtRef.current = null
  }

  const handleCompletion = () => {
    setIsComplete(true)

    if (prefersReducedMotion) {
      setIsCouponOpen(true)
      return
    }

    setShowBurst(true)

    if (couponTimerRef.current !== null) {
      window.clearTimeout(couponTimerRef.current)
    }
    if (burstTimerRef.current !== null) {
      window.clearTimeout(burstTimerRef.current)
    }

    couponTimerRef.current = window.setTimeout(() => {
      setIsCouponOpen(true)
      couponTimerRef.current = null
    }, COUPON_REVEAL_DELAY_MS)

    burstTimerRef.current = window.setTimeout(() => {
      setShowBurst(false)
      burstTimerRef.current = null
    }, BURST_DURATION_MS)
  }

  const stopHold = () => {
    if (isComplete) {
      return
    }

    clearHoldAnimation()
    setIsHolding(false)
    setHoldProgress(0)
  }

  const startHold = (hugId: HugOption['id']) => {
    if (isComplete || isHolding) {
      return
    }

    setSelectedHugId(hugId)
    clearHoldAnimation()
    setHoldProgress(0)
    setIsHolding(true)
    holdStartedAtRef.current = performance.now()

    const tick = (timestamp: number) => {
      if (holdStartedAtRef.current === null) {
        return
      }

      const elapsed = timestamp - holdStartedAtRef.current
      const nextProgress = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100)
      setHoldProgress(nextProgress)

      if (nextProgress >= 100) {
        clearHoldAnimation()
        setIsHolding(false)
        setHoldProgress(100)
        handleCompletion()
        return
      }

      holdAnimationRef.current = requestAnimationFrame(tick)
    }

    holdAnimationRef.current = requestAnimationFrame(tick)
  }

  const resetInteraction = () => {
    clearHoldAnimation()

    if (couponTimerRef.current !== null) {
      window.clearTimeout(couponTimerRef.current)
      couponTimerRef.current = null
    }

    if (burstTimerRef.current !== null) {
      window.clearTimeout(burstTimerRef.current)
      burstTimerRef.current = null
    }

    setSelectedHugId(null)
    setHoldProgress(0)
    setIsHolding(false)
    setIsComplete(false)
    setIsCouponOpen(false)
    setShowBurst(false)
  }

  return (
    <PageLayout backgroundSrc={day.background} title={day.title} showBackButton onBack={() => window.history.back()}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-6 md:gap-8">
        <section className="dreamy-surface px-6 py-7 text-center md:px-10 md:py-8">
          <img src={day.icon} alt="" aria-hidden className="mx-auto h-14 w-14 object-contain md:h-16 md:w-16" />
          <h2 className="mt-4 text-3xl font-semibold text-rich-brown md:text-4xl">Choose A Hug, Then Hold Tight</h2>
          <p className="mx-auto mt-2 max-w-2xl text-cocoa">
            Pick the hug style floating around you, then press and hold to charge it up.
          </p>
        </section>

        <section className="px-1 py-1 md:px-2 md:py-2">
          <div className="relative mx-auto w-full max-w-5xl">
            <div className="relative h-[38rem] overflow-visible sm:h-[38rem]">
              {showBurst ? (
                <img
                  src="/assets/ui/confetti-hearts-set.svg"
                  alt=""
                  aria-hidden
                  className={clsx(
                    'pointer-events-none absolute inset-0 h-full w-full object-cover opacity-70',
                    !prefersReducedMotion && 'animate-pulse-glow-soft',
                  )}
                />
              ) : null}

              <div className="absolute inset-0 z-20 overflow-visible">
                {floatingOptions.map((option, index) => {
                  const isSelected = selectedHugId === option.id
                  const xDriftPath =
                    option.left < 48
                      ? [0, -28, -10, -22, 8, -18, 0]
                      : option.left > 52
                        ? [0, 28, 10, 22, -8, 18, 0]
                        : [0, -34, 24, -26, 18, -14, 0]
                  const yDriftPath =
                    option.top < 30
                      ? [0, -16, 8, -10, 12, -6, 0]
                      : option.top > 70
                        ? [0, -9, 4, -7, 5, -3, 0]
                        : [0, -14, 9, -11, 7, -6, 0]

                  return (
                    <motion.button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        if (isComplete) {
                          return
                        }

                        clearHoldAnimation()
                        setIsHolding(false)
                        setHoldProgress(0)

                        setSelectedHugId(option.id)
                      }}
                      onPointerDown={(event) => {
                        if (isComplete) {
                          return
                        }

                        event.preventDefault()
                        event.currentTarget.setPointerCapture(event.pointerId)
                        startHold(option.id)
                      }}
                      onPointerUp={(event) => {
                        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                          event.currentTarget.releasePointerCapture(event.pointerId)
                        }
                        stopHold()
                      }}
                      onPointerCancel={stopHold}
                      onPointerLeave={stopHold}
                      onKeyDown={(event) => {
                        if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) {
                          event.preventDefault()
                          startHold(option.id)
                        }
                      }}
                      onKeyUp={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          stopHold()
                        }
                      }}
                      className={clsx(
                        'absolute rounded-2xl border bg-white/88 px-3 py-2 shadow-sticker transition',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soft-rose/80 focus-visible:ring-offset-2',
                        isComplete ? 'cursor-default' : 'cursor-pointer hover:shadow-glow',
                        isSelected ? 'border-soft-rose ring-2 ring-soft-rose/50' : 'border-white/70',
                      )}
                      style={{
                        left: `${option.left}%`,
                        top: `${option.top}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      animate={
                        isSelected
                          ? {
                              rotate: option.rotate,
                              scale: option.scale * 1.03,
                              y: 0,
                              x: 0,
                            }
                          : prefersReducedMotion
                            ? {
                                rotate: option.rotate,
                                scale: option.scale,
                                x: 0,
                                y: 0,
                              }
                            : {
                                rotate: [option.rotate, option.rotate - 5, option.rotate + 5, option.rotate - 2, option.rotate],
                                scale: [option.scale, option.scale * 1.07, option.scale * 0.99, option.scale * 1.05, option.scale],
                                x: xDriftPath,
                                y: yDriftPath,
                              }
                      }
                      transition={
                        isSelected
                          ? { type: 'spring', stiffness: 260, damping: 21, duration: 0.45 }
                          : prefersReducedMotion
                            ? { duration: 0.05 }
                            : {
                                duration: 6.2 + index * 0.6,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: 'easeInOut',
                              }
                      }
                      whileHover={isComplete || isSelected ? undefined : { scale: option.scale * 1.1 }}
                      aria-pressed={isSelected}
                      aria-label={`Hold ${option.label}`}
                    >
                      <img src={option.image} alt="" aria-hidden className="mx-auto h-12 w-12 object-contain md:h-14 md:w-14" />
                      <p className="mt-1 text-center text-[11px] font-semibold leading-tight text-rich-brown md:text-xs">
                        {option.label}
                      </p>
                    </motion.button>
                  )
                })}
              </div>

              <div className="absolute left-1/2 top-[50%] z-10 w-[min(82%,23rem)] -translate-x-1/2 -translate-y-1/2">
                <div className="rounded-3xl border border-white/70 bg-cream/80 p-5 text-center shadow-dreamy md:p-6">
                  <p className="text-xs uppercase tracking-[0.15em] text-soft-brown">Hug Meter</p>
                  <p className="mt-2 text-base font-semibold text-rich-brown md:text-lg">
                    {selectedHug ? selectedHug.label : 'Choose a floating hug first'}
                  </p>

                  <div className="mt-4">
                    <HugMeter progress={holdProgress} />
                    <p className="mt-1 text-sm font-semibold text-cocoa">{Math.round(holdProgress)}%</p>
                  </div>

                  <p className="mt-4 text-sm font-semibold text-rich-brown">
                    {isComplete
                      ? 'Hug fully charged.'
                      : isHolding
                        ? 'Keep holding the selected hug button...'
                        : 'Press and hold any floating hug button.'}
                  </p>

                  {isComplete ? (
                    <Button variant="secondary" className="mt-3 w-full" onClick={() => setIsCouponOpen(true)}>
                      Open Hug Coupon
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-3 md:mt-16">
            <Button variant="secondary" onClick={resetInteraction}>
              Reset Hug
            </Button>
            <Link to={{ pathname: '/', search: location.search, hash: '#roadmap' }}>
              <Button variant="secondary">Back to Home</Button>
            </Link>
          </div>
        </section>
      </div>

      <Modal isOpen={isCouponOpen} onClose={() => setIsCouponOpen(false)} title="Hug Day Coupon">
        <div className="space-y-5">
          <div ref={couponRef}>
            <CouponCard dayId="hug-day" title="Hug Day" rewardText={rewardText} />
          </div>

          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button variant="secondary" onClick={resetInteraction}>
              Choose Another Hug
            </Button>
            <Button variant="secondary" onClick={() => setIsCouponOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                void downloadCoupon(couponRef.current, {
                  dayId: 'hug-day',
                  selection: selectedHug?.id,
                })
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
