import { useEffect, useMemo, useRef, useState } from 'react'
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

interface FloatingHeart {
  id: number
  left: number
  top: number
  size: number
  duration: number
  delay: number
}

type ChoiceRole = 'yes' | 'no'
type ChoiceSlot = 'left' | 'right'

const SCRAMBLE_CHARS = 'YESNOLOVE?'
const SCRAMBLE_STEPS = 6
const SCRAMBLE_INTERVAL_MS = 50
const COUPON_REVEAL_DELAY_MS = 4000
const REWARD_TEXT = 'The grand finale date with your forever yes.'

function randomChar() {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
}

function createScrambleText(length: number) {
  return Array.from({ length }, () => randomChar()).join('')
}

export default function ValentinesDay() {
  const [choiceOrder, setChoiceOrder] = useState<[ChoiceRole, ChoiceRole]>(['yes', 'no'])
  const [scrambleSlot, setScrambleSlot] = useState<ChoiceSlot | null>(null)
  const [scrambleLabel, setScrambleLabel] = useState<string | null>(null)
  const [isTeasing, setIsTeasing] = useState(false)
  const [isCelebrating, setIsCelebrating] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isCouponOpen, setIsCouponOpen] = useState(false)
  const couponRef = useRef<HTMLDivElement>(null)
  const scrambleTimerRef = useRef<number | null>(null)
  const rewardTimerRef = useRef<number | null>(null)
  const { downloadCoupon, isDownloading, error } = useCouponDownload()
  const location = useLocation()
  const debug = parseDebugConfig(location.search)
  const prefersReducedMotion = useReducedMotionPreference()
  const liveNow = useNow()
  const now = debug.debugDate ? getNow(debug) : liveNow
  const day = getDayById('valentines-day')

  const ambientHearts = useMemo<FloatingHeart[]>(
    () => [
      { id: 1, left: 8, top: 14, size: 14, duration: 9.4, delay: 0.5 },
      { id: 2, left: 18, top: 26, size: 11, duration: 10.2, delay: 1.1 },
      { id: 3, left: 25, top: 11, size: 13, duration: 8.8, delay: 0.2 },
      { id: 4, left: 33, top: 28, size: 12, duration: 10.5, delay: 1.4 },
      { id: 5, left: 43, top: 12, size: 10, duration: 9.1, delay: 0.8 },
      { id: 6, left: 58, top: 14, size: 13, duration: 9.7, delay: 0.4 },
      { id: 7, left: 70, top: 28, size: 11, duration: 10.7, delay: 1.5 },
      { id: 8, left: 81, top: 16, size: 14, duration: 9.3, delay: 0.3 },
      { id: 9, left: 90, top: 29, size: 10, duration: 10.1, delay: 1.2 },
      { id: 10, left: 14, top: 67, size: 13, duration: 9.5, delay: 0.9 },
      { id: 11, left: 86, top: 72, size: 12, duration: 10.4, delay: 1.3 },
    ],
    [],
  )

  const clearScrambleTimer = () => {
    if (scrambleTimerRef.current !== null) {
      window.clearInterval(scrambleTimerRef.current)
      scrambleTimerRef.current = null
    }
  }

  const clearRewardTimer = () => {
    if (rewardTimerRef.current !== null) {
      window.clearTimeout(rewardTimerRef.current)
      rewardTimerRef.current = null
    }
  }

  const getChoiceAsset = (role: ChoiceRole) => {
    return role === 'yes' ? '/assets/valentines-day/button-yes.svg' : '/assets/valentines-day/button-no.svg'
  }

  const getChoiceLabel = (role: ChoiceRole, slot: ChoiceSlot) => {
    if (role === 'no' && slot === scrambleSlot && scrambleLabel) {
      return scrambleLabel
    }

    return role === 'yes' ? 'Yes' : 'No'
  }

  useEffect(() => {
    return () => {
      clearScrambleTimer()
      clearRewardTimer()
    }
  }, [])

  if (debug.invalidDayId) {
    return <DebugErrorView invalidDayId={debug.invalidDayId} />
  }

  if (!isUnlocked(day.id, now, debug)) {
    return <LockedView title={day.title} unlockAt={getDayUnlockAt(day.id, now)} backgroundSrc={day.background} />
  }

  const teaseNoChoice = () => {
    if (isCelebrating || isTeasing) {
      return
    }

    const currentNoSlot: ChoiceSlot = choiceOrder[0] === 'no' ? 'left' : 'right'
    let steps = 0

    setIsTeasing(true)
    setScrambleSlot(currentNoSlot)
    setScrambleLabel(createScrambleText(2))
    clearScrambleTimer()

    scrambleTimerRef.current = window.setInterval(() => {
      steps += 1

      if (steps >= SCRAMBLE_STEPS) {
        clearScrambleTimer()
        setScrambleLabel(null)
        setScrambleSlot(null)
        setChoiceOrder(([leftRole, rightRole]) => [rightRole, leftRole])
        setIsTeasing(false)
        return
      }

      setScrambleLabel(createScrambleText(2))
    }, SCRAMBLE_INTERVAL_MS)
  }

  const selectYes = () => {
    if (isCelebrating) {
      return
    }

    clearScrambleTimer()
    setScrambleLabel(null)
    setScrambleSlot(null)
    setIsTeasing(false)
    setIsCelebrating(true)
    setShowConfetti(true)

    rewardTimerRef.current = window.setTimeout(() => {
      setIsCouponOpen(true)
      rewardTimerRef.current = null
    }, COUPON_REVEAL_DELAY_MS)
  }

  const resetFinale = () => {
    clearScrambleTimer()
    clearRewardTimer()
    setChoiceOrder(['yes', 'no'])
    setScrambleLabel(null)
    setScrambleSlot(null)
    setIsTeasing(false)
    setIsCelebrating(false)
    setShowConfetti(false)
    setIsCouponOpen(false)
  }

  const leftChoice = choiceOrder[0]
  const rightChoice = choiceOrder[1]

  return (
    <PageLayout backgroundSrc={day.background} title={day.title} showBackButton onBack={() => window.history.back()}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-6 md:gap-8">
        <section className="dreamy-surface px-6 py-7 text-center md:px-10 md:py-8">
          <img src={day.icon} alt="" aria-hidden className="mx-auto h-14 w-14 object-contain md:h-16 md:w-16" />
          <h2 className="mt-4 text-3xl font-semibold text-rich-brown md:text-4xl">One Final Question</h2>
          <p className="mx-auto mt-2 max-w-2xl text-cocoa">
            Before we reach the final promise, pick your answer from this little floating chaos.
          </p>
        </section>

        <section className="px-1 py-1 md:px-2 md:py-2">
          <div className="relative mx-auto h-[34rem] w-full max-w-5xl overflow-visible rounded-[2rem] border border-white/55 bg-white/28 shadow-dreamy backdrop-blur-sm">
            <img
              src="/assets/valentines-day/scramble-sparkles.svg"
              alt=""
              aria-hidden
              className="pointer-events-none absolute left-6 top-7 w-40 opacity-40"
            />
            <img
              src="/assets/valentines-day/scramble-sparkles.svg"
              alt=""
              aria-hidden
              className="pointer-events-none absolute bottom-8 right-7 w-44 opacity-35"
            />

            {ambientHearts.map((heart) => (
              <motion.img
                key={heart.id}
                src="/assets/ui/heart-small.svg"
                alt=""
                aria-hidden
                className="pointer-events-none absolute opacity-30"
                style={{
                  left: `${heart.left}%`,
                  top: `${heart.top}%`,
                  width: heart.size,
                  height: heart.size,
                }}
                animate={prefersReducedMotion ? { y: 0, opacity: 0.25 } : { y: [0, -9, 0], opacity: [0.2, 0.38, 0.2] }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0.05 }
                    : {
                        duration: heart.duration,
                        delay: heart.delay,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: 'easeInOut',
                      }
                }
              />
            ))}

            <div className="pointer-events-none absolute left-1/2 top-[16%] z-20 w-[92%] max-w-xl -translate-x-1/2 text-center">
              <p className="text-sm uppercase tracking-[0.2em] text-soft-brown">Forever Question</p>
              <h3 className="mt-2 text-2xl font-semibold text-rich-brown md:text-3xl">
                Will you keep being my favorite person forever, sweetheart?
              </h3>
            </div>

            <div className="relative z-30 flex h-full flex-col items-center justify-start px-4 pb-10 pt-44 md:pt-48">
              <div className="relative h-[11.5rem] w-[11.5rem] md:h-[13rem] md:w-[13rem]">
                {showConfetti ? (
                  <>
                    <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,212,229,0.42),rgba(255,212,229,0.08)_58%,transparent_82%)]" />
                    <motion.img
                      src="/assets/valentines-day/confetti-hearts.svg"
                      alt=""
                      aria-hidden
                      className="pointer-events-none absolute inset-0 h-full w-full object-contain"
                      initial={{ opacity: 0, scale: 0.62, y: 18 }}
                      animate={
                        prefersReducedMotion
                          ? { opacity: 1, scale: 1, y: 0 }
                          : { opacity: [0.15, 1, 1], scale: [0.62, 1.05, 1], y: [18, 6, 0] }
                      }
                      transition={{ duration: prefersReducedMotion ? 0.25 : 1.05, ease: 'easeOut' }}
                    />
                  </>
                ) : (
                  <motion.img
                    src="/assets/valentines-day/golden-heart.svg"
                    alt=""
                    aria-hidden
                    className="pointer-events-none h-auto w-full drop-shadow-[0_20px_35px_rgba(139,111,71,0.3)]"
                    animate={prefersReducedMotion ? { y: 0, scale: 1 } : { y: [0, -9, 0], scale: [1, 1.03, 1] }}
                    transition={{
                      duration: prefersReducedMotion ? 0.05 : 5.5,
                      repeat: prefersReducedMotion ? 0 : Number.POSITIVE_INFINITY,
                      ease: 'easeInOut',
                    }}
                  />
                )}
              </div>

              {isCelebrating ? (
                <motion.p
                  className="pointer-events-none mt-10 rounded-full border border-white/70 bg-white/78 px-4 py-2 text-base font-semibold text-rich-brown shadow-glow md:mt-12 md:text-lg"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  I love you to the moon, to infinity and beyond. Now and forever.
                </motion.p>
              ) : null}

              <div className="mt-12 flex items-center justify-center gap-4 px-3 sm:gap-6 md:mt-14 md:gap-8">
                <motion.button
                  type="button"
                  onPointerEnter={() => {
                    if (leftChoice === 'no') {
                      teaseNoChoice()
                    }
                  }}
                  onFocus={() => {
                    if (leftChoice === 'no') {
                      teaseNoChoice()
                    }
                  }}
                  onClick={(event) => {
                    if (leftChoice === 'yes') {
                      selectYes()
                      return
                    }

                    event.preventDefault()
                    teaseNoChoice()
                  }}
                  className="relative z-50 h-[4rem] w-[9rem] rounded-full p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soft-rose/80 focus-visible:ring-offset-2 sm:w-[10.8rem] md:w-[12.6rem]"
                  animate={
                    prefersReducedMotion
                      ? { x: 0, y: 0, rotate: 0 }
                      : { x: [0, 12, -8, 9, 0], y: [0, -10, 6, -5, 0], rotate: [-2, 1, -1, 2, -2] }
                  }
                  transition={{
                    duration: prefersReducedMotion ? 0.05 : 8.6,
                    repeat: prefersReducedMotion ? 0 : Number.POSITIVE_INFINITY,
                    ease: 'easeInOut',
                  }}
                  aria-label={leftChoice === 'yes' ? 'Yes' : 'No'}
                >
                  <img src={getChoiceAsset(leftChoice)} alt="" aria-hidden className="h-full w-full object-contain" />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center pb-[0.08rem] text-base font-semibold text-rich-brown sm:text-lg">
                    {getChoiceLabel(leftChoice, 'left')}
                  </span>
                </motion.button>

                <motion.button
                  type="button"
                  onPointerEnter={() => {
                    if (rightChoice === 'no') {
                      teaseNoChoice()
                    }
                  }}
                  onFocus={() => {
                    if (rightChoice === 'no') {
                      teaseNoChoice()
                    }
                  }}
                  onClick={(event) => {
                    if (rightChoice === 'yes') {
                      selectYes()
                      return
                    }

                    event.preventDefault()
                    teaseNoChoice()
                  }}
                  className="relative z-50 h-[4rem] w-[9rem] rounded-full p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soft-rose/80 focus-visible:ring-offset-2 sm:w-[10.8rem] md:w-[12.6rem]"
                  animate={
                    prefersReducedMotion
                      ? { x: 0, y: 0, rotate: 0 }
                      : { x: [0, -14, 10, -8, 0], y: [0, 9, -7, 5, 0], rotate: [2, -1, 1, -2, 2] }
                  }
                  transition={{
                    duration: prefersReducedMotion ? 0.05 : 7.9,
                    repeat: prefersReducedMotion ? 0 : Number.POSITIVE_INFINITY,
                    ease: 'easeInOut',
                  }}
                  aria-label={rightChoice === 'yes' ? 'Yes' : 'No'}
                >
                  <img src={getChoiceAsset(rightChoice)} alt="" aria-hidden className="h-full w-full object-contain" />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center pb-[0.08rem] text-base font-semibold text-rich-brown sm:text-lg">
                    {getChoiceLabel(rightChoice, 'right')}
                  </span>
                </motion.button>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button variant="secondary" onClick={resetFinale}>
              Reset Finale
            </Button>
            <Link to={{ pathname: '/', search: location.search, hash: '#roadmap' }}>
              <Button variant="secondary">Back to Home</Button>
            </Link>
          </div>
        </section>
      </div>

      <Modal isOpen={isCouponOpen} onClose={() => setIsCouponOpen(false)} title="Valentine's Day Coupon">
        <div className="space-y-5">
          <div ref={couponRef}>
            <CouponCard dayId="valentines-day" title="Valentine's Day" rewardText={REWARD_TEXT} />
          </div>

          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsCouponOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                void downloadCoupon(couponRef.current, { dayId: 'valentines-day' })
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
