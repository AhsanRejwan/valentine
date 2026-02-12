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

const PROMISE_QUEUE = [
  'I promise to always not fart too loud',
  'I promise to not pull up my pants in front of your friends',
  'I promise to help you in the kitchen',
  "I promise to protect you always, even if it's from me",
  'I promise that while i may not be able to fix all your problems for you, we will always get through them together. And I will always make you laugh and never leave your side even if you try your best to make me',
] as const

const FINAL_PROMISE = PROMISE_QUEUE[PROMISE_QUEUE.length - 1]

const PROMISE_BOX_SPRITES = [
  '/assets/promise-day/promise-box-closed-1.svg',
  '/assets/promise-day/promise-box-closed-2.svg',
  '/assets/promise-day/promise-box-closed-3.svg',
  '/assets/promise-day/promise-box-closed-4.svg',
] as const

type FloatingBoxPlacement = {
  top: number
  left: number
  rotate: number
  scale: number
}

type FloatingBox = {
  id: number
  src: string
  top: number
  left: number
  rotate: number
  scale: number
}

// Curated layouts with safe spacing to keep boxes from overlapping.
const BOX_POSITION_LAYOUTS: readonly (readonly FloatingBoxPlacement[])[] = [
  [
    { top: 16, left: 16, rotate: -10, scale: 1.03 },
    { top: 17, left: 50, rotate: 8, scale: 0.99 },
    { top: 19, left: 84, rotate: -6, scale: 1.05 },
    { top: 53, left: 30, rotate: 9, scale: 1.01 },
    { top: 55, left: 70, rotate: -8, scale: 1.03 },
  ],
  [
    { top: 17, left: 18, rotate: 9, scale: 0.98 },
    { top: 14, left: 52, rotate: -7, scale: 1.03 },
    { top: 18, left: 82, rotate: 10, scale: 1 },
    { top: 54, left: 26, rotate: -9, scale: 1.04 },
    { top: 56, left: 74, rotate: 6, scale: 1.02 },
  ],
  [
    { top: 15, left: 20, rotate: -8, scale: 1.01 },
    { top: 19, left: 48, rotate: 7, scale: 1.04 },
    { top: 16, left: 80, rotate: -9, scale: 0.99 },
    { top: 56, left: 33, rotate: 8, scale: 1.02 },
    { top: 52, left: 67, rotate: -7, scale: 1.03 },
  ],
] as const

function buildFloatingBoxes(count: number): FloatingBox[] {
  const pickedLayout = BOX_POSITION_LAYOUTS[Math.floor(Math.random() * BOX_POSITION_LAYOUTS.length)]
  const positions = [...pickedLayout]

  for (let index = positions.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const current = positions[index]
    positions[index] = positions[randomIndex]
    positions[randomIndex] = current
  }

  return Array.from({ length: count }, (_, index) => {
    const position = positions[index % positions.length]

    return {
      id: index + 1,
      src: PROMISE_BOX_SPRITES[index % PROMISE_BOX_SPRITES.length],
      ...position,
    }
  })
}

export default function PromiseDay() {
  const [boxPromiseIndexById, setBoxPromiseIndexById] = useState<Record<number, number>>({})
  const [isPromiseOpen, setIsPromiseOpen] = useState(false)
  const [activePromise, setActivePromise] = useState<string | null>(null)
  const [isCouponOpen, setIsCouponOpen] = useState(false)
  const [showFinalConfetti, setShowFinalConfetti] = useState(false)
  const couponRef = useRef<HTMLDivElement>(null)
  const couponRevealTimerRef = useRef<number | null>(null)
  const confettiTimerRef = useRef<number | null>(null)
  const { downloadCoupon, isDownloading, error } = useCouponDownload()
  const location = useLocation()
  const debug = parseDebugConfig(location.search)
  const prefersReducedMotion = useReducedMotionPreference()
  const liveNow = useNow()
  const now = debug.debugDate ? getNow(debug) : liveNow
  const day = getDayById('promise-day')
  const floatingBoxes = useMemo(() => buildFloatingBoxes(PROMISE_QUEUE.length), [])

  const revealedCount = Object.keys(boxPromiseIndexById).length
  const isComplete = revealedCount >= PROMISE_QUEUE.length

  useEffect(() => {
    return () => {
      if (couponRevealTimerRef.current !== null) {
        window.clearTimeout(couponRevealTimerRef.current)
      }
      if (confettiTimerRef.current !== null) {
        window.clearTimeout(confettiTimerRef.current)
      }
    }
  }, [])

  if (debug.invalidDayId) {
    return <DebugErrorView invalidDayId={debug.invalidDayId} />
  }

  if (!isUnlocked(day.id, now, debug)) {
    return <LockedView title={day.title} unlockAt={getDayUnlockAt(day.id, now)} backgroundSrc={day.background} />
  }

  const revealNextPromise = (boxId: number) => {
    const existingPromiseIndex = boxPromiseIndexById[boxId]
    if (existingPromiseIndex !== undefined) {
      setActivePromise(PROMISE_QUEUE[existingPromiseIndex])
      setIsPromiseOpen(true)
      return
    }

    if (revealedCount >= PROMISE_QUEUE.length) {
      return
    }

    const nextPromiseIndex = revealedCount
    const nextPromise = PROMISE_QUEUE[nextPromiseIndex]
    const isFinalPromise = nextPromiseIndex === PROMISE_QUEUE.length - 1
    setBoxPromiseIndexById((current) => ({ ...current, [boxId]: nextPromiseIndex }))
    setActivePromise(nextPromise)

    if (!isFinalPromise) {
      setIsPromiseOpen(true)
      return
    }

    setIsPromiseOpen(false)
    setShowFinalConfetti(!prefersReducedMotion)

    if (couponRevealTimerRef.current !== null) {
      window.clearTimeout(couponRevealTimerRef.current)
    }
    if (confettiTimerRef.current !== null) {
      window.clearTimeout(confettiTimerRef.current)
    }

    if (prefersReducedMotion) {
      setIsCouponOpen(true)
      return
    }

    couponRevealTimerRef.current = window.setTimeout(() => {
      setIsCouponOpen(true)
      couponRevealTimerRef.current = null
    }, 680)

    confettiTimerRef.current = window.setTimeout(() => {
      setShowFinalConfetti(false)
      confettiTimerRef.current = null
    }, 2100)
  }

  const resetPromises = () => {
    if (couponRevealTimerRef.current !== null) {
      window.clearTimeout(couponRevealTimerRef.current)
      couponRevealTimerRef.current = null
    }
    if (confettiTimerRef.current !== null) {
      window.clearTimeout(confettiTimerRef.current)
      confettiTimerRef.current = null
    }

    setBoxPromiseIndexById({})
    setIsPromiseOpen(false)
    setIsCouponOpen(false)
    setActivePromise(null)
    setShowFinalConfetti(false)
  }

  return (
    <PageLayout backgroundSrc={day.background} title={day.title} showBackButton onBack={() => window.history.back()}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-6 md:gap-8">
        <section className="dreamy-surface px-6 py-7 text-center md:px-10 md:py-8">
          <img src={day.icon} alt="" aria-hidden className="mx-auto h-14 w-14 object-contain md:h-16 md:w-16" />
          <h2 className="mt-4 text-3xl font-semibold text-rich-brown md:text-4xl">Open The Floating Promise Boxes</h2>
          <p className="mx-auto mt-2 max-w-2xl text-cocoa">
            One grand hidden promise is buried in this field. Keep opening boxes until the answer meant for you appears.
          </p>
        </section>

        <section className="px-2 py-2 md:px-3 md:py-3">
          <div className="relative min-h-[20rem]">
            <h3 className="text-center text-lg font-semibold text-rich-brown">Mystery Promise Field</h3>
            <p className="mt-1 text-center text-xs uppercase tracking-wide text-soft-brown">Find the grand hidden promise</p>

            <div className="relative mt-5 h-[15rem] sm:h-[18rem]">
              {showFinalConfetti ? (
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

              {floatingBoxes.map((box) => {
                const isOpened = boxPromiseIndexById[box.id] !== undefined

                return (
                  <motion.button
                    key={box.id}
                    type="button"
                    onClick={() => revealNextPromise(box.id)}
                    className={clsx(
                      'absolute cursor-pointer bg-transparent p-0 leading-none',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soft-rose/80 focus-visible:ring-offset-2',
                    )}
                    animate={{
                      rotate: box.rotate,
                      scale: box.scale,
                      opacity: isOpened ? 0.9 : 1,
                    }}
                    whileHover={isComplete ? undefined : { scale: box.scale * 1.05 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                    style={{
                      left: `${box.left}%`,
                      top: `${box.top}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    aria-label={`Reveal promise with floating box ${box.id}`}
                  >
                    <img
                      src={box.src}
                      alt=""
                      aria-hidden
                      className="mx-auto h-14 w-14 object-contain drop-shadow-[0_8px_16px_rgba(107,68,35,0.28)] md:h-16 md:w-16"
                    />
                  </motion.button>
                )
              })}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button variant="secondary" onClick={resetPromises}>
              Reset Promises
            </Button>
            <Link to={{ pathname: '/', search: location.search, hash: '#roadmap' }}>
              <Button variant="secondary">Back to Home</Button>
            </Link>
          </div>
        </section>
      </div>

      <Modal isOpen={isPromiseOpen} onClose={() => setIsPromiseOpen(false)} title="Promise Unlocked">
        <div className="space-y-4">
          {activePromise ? (
            <motion.p
              key={activePromise}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0.05 : 0.2 }}
              className={clsx(
                'rounded-xl border px-4 py-3 text-sm leading-relaxed',
                activePromise === FINAL_PROMISE
                  ? 'border-soft-gold bg-soft-gold/25 font-semibold text-rich-brown'
                  : 'border-white/70 bg-white/75 text-cocoa',
              )}
            >
              {activePromise}
            </motion.p>
          ) : null}

          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setIsPromiseOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isCouponOpen} onClose={() => setIsCouponOpen(false)} title="Your Grand Promise Coupon">
        <div className="space-y-5">
          <div ref={couponRef}>
            <CouponCard dayId="promise-day" title="Promise Day" rewardText={FINAL_PROMISE} />
          </div>

          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsCouponOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                void downloadCoupon(couponRef.current, { dayId: 'promise-day' })
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
