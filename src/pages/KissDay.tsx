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

interface FloatingKiss {
  id: number
  xPercent: number
  durationMs: number
  scale: number
  driftPx: number
  assetSrc: string
  caught: boolean
}

interface KissBurst {
  id: number
  x: number
  y: number
}

interface AmbientHeart {
  id: number
  left: number
  top: number
  size: number
  duration: number
  delay: number
}

const KISSES_TO_WIN = 10
const SPAWN_MIN_MS = 220
const SPAWN_MAX_MS = 460
const FLOAT_MIN_MS = 4000
const FLOAT_MAX_MS = 7000
const POP_DURATION_SECONDS = 0.25
const BURST_LIFETIME_MS = 550
const REWARD_DELAY_MS = 780
const MAX_ACTIVE_KISSES = 18
const REWARD_TEXT = 'Redeem for unlimited kisses from your personal boy toy 💋'
const KISS_MARK_ASSETS = [
  '/assets/kiss-day/kiss-mark-1.svg',
  '/assets/kiss-day/kiss-mark-2.svg',
  '/assets/kiss-day/kiss-mark-3.svg',
  '/assets/kiss-day/kiss-mark-4.svg',
  '/assets/kiss-day/kiss-mark-5.svg',
]

function randomInRange(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function randomInt(min: number, max: number) {
  return Math.floor(randomInRange(min, max + 1))
}

function shuffleArray<T>(items: T[]): T[] {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const current = shuffled[index]
    shuffled[index] = shuffled[swapIndex]
    shuffled[swapIndex] = current
  }
  return shuffled
}

function createKiss(id: number, assetSrc: string): FloatingKiss {
  const driftDirection = Math.random() > 0.5 ? 1 : -1
  return {
    id,
    xPercent: randomInRange(10, 90),
    durationMs: randomInt(FLOAT_MIN_MS, FLOAT_MAX_MS),
    scale: Number(randomInRange(0.8, 1.2).toFixed(2)),
    driftPx: randomInRange(12, 34) * driftDirection,
    assetSrc,
    caught: false,
  }
}

function KissMeter({ progress }: { progress: number }) {
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

export default function KissDay() {
  const [kisses, setKisses] = useState<FloatingKiss[]>([])
  const [bursts, setBursts] = useState<KissBurst[]>([])
  const [kissCount, setKissCount] = useState(0)
  const [isRewardTriggered, setIsRewardTriggered] = useState(false)
  const [showRewardGlow, setShowRewardGlow] = useState(false)
  const [isCouponOpen, setIsCouponOpen] = useState(false)
  const couponRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const spawnTimerRef = useRef<number | null>(null)
  const rewardTimerRef = useRef<number | null>(null)
  const burstTimersRef = useRef<number[]>([])
  const nextKissIdRef = useRef(1)
  const nextBurstIdRef = useRef(1)
  const rewardTriggeredRef = useRef(false)
  const kissAssetBagRef = useRef<string[]>(shuffleArray(KISS_MARK_ASSETS))
  const { downloadCoupon, isDownloading, error } = useCouponDownload()
  const location = useLocation()
  const debug = parseDebugConfig(location.search)
  const prefersReducedMotion = useReducedMotionPreference()
  const liveNow = useNow()
  const now = debug.debugDate ? getNow(debug) : liveNow
  const day = getDayById('kiss-day')

  const meterProgress = Math.min(100, kissCount * 10)

  const ambientHearts = useMemo<AmbientHeart[]>(
    () => [
      { id: 1, left: 8, top: 18, size: 14, duration: 10.4, delay: 0.2 },
      { id: 2, left: 19, top: 41, size: 12, duration: 11.6, delay: 1.2 },
      { id: 3, left: 30, top: 12, size: 10, duration: 9.8, delay: 0.8 },
      { id: 4, left: 44, top: 24, size: 16, duration: 12, delay: 1.6 },
      { id: 5, left: 58, top: 10, size: 12, duration: 10.7, delay: 0.4 },
      { id: 6, left: 69, top: 34, size: 13, duration: 9.9, delay: 1.9 },
      { id: 7, left: 82, top: 16, size: 11, duration: 11.3, delay: 0.6 },
      { id: 8, left: 91, top: 44, size: 15, duration: 10.5, delay: 1.4 },
    ],
    [],
  )

  const rewardHearts = useMemo<AmbientHeart[]>(
    () => [
      { id: 101, left: 8, top: 82, size: 16, duration: 2.8, delay: 0 },
      { id: 102, left: 16, top: 88, size: 14, duration: 3.2, delay: 0.35 },
      { id: 103, left: 25, top: 86, size: 18, duration: 3, delay: 0.15 },
      { id: 104, left: 34, top: 90, size: 20, duration: 3.4, delay: 0.52 },
      { id: 105, left: 43, top: 84, size: 15, duration: 2.9, delay: 0.23 },
      { id: 106, left: 51, top: 89, size: 18, duration: 3.3, delay: 0.41 },
      { id: 107, left: 60, top: 85, size: 16, duration: 2.85, delay: 0.12 },
      { id: 108, left: 69, top: 88, size: 20, duration: 3.5, delay: 0.5 },
      { id: 109, left: 77, top: 84, size: 15, duration: 3.1, delay: 0.19 },
      { id: 110, left: 85, top: 90, size: 18, duration: 3.25, delay: 0.6 },
      { id: 111, left: 92, top: 86, size: 14, duration: 2.95, delay: 0.3 },
    ],
    [],
  )

  useEffect(() => {
    rewardTriggeredRef.current = isRewardTriggered
  }, [isRewardTriggered])

  useEffect(() => {
    return () => {
      if (spawnTimerRef.current !== null) {
        window.clearTimeout(spawnTimerRef.current)
      }
      if (rewardTimerRef.current !== null) {
        window.clearTimeout(rewardTimerRef.current)
      }
      burstTimersRef.current.forEach((timerId) => window.clearTimeout(timerId))
      burstTimersRef.current = []
    }
  }, [])

  if (debug.invalidDayId) {
    return <DebugErrorView invalidDayId={debug.invalidDayId} />
  }

  if (!isUnlocked(day.id, now, debug)) {
    return <LockedView title={day.title} unlockAt={getDayUnlockAt(day.id, now)} backgroundSrc={day.background} />
  }

  const clearSpawnTimer = () => {
    if (spawnTimerRef.current !== null) {
      window.clearTimeout(spawnTimerRef.current)
      spawnTimerRef.current = null
    }
  }

  const clearRewardTimer = () => {
    if (rewardTimerRef.current !== null) {
      window.clearTimeout(rewardTimerRef.current)
      rewardTimerRef.current = null
    }
  }

  const queueNextSpawn = () => {
    if (rewardTriggeredRef.current) {
      return
    }

    const delayMs = randomInt(SPAWN_MIN_MS, SPAWN_MAX_MS)
    spawnTimerRef.current = window.setTimeout(() => {
      if (rewardTriggeredRef.current) {
        return
      }

      setKisses((current) => {
        if (current.length >= MAX_ACTIVE_KISSES) {
          return current
        }

        const nextId = nextKissIdRef.current
        nextKissIdRef.current += 1
        if (kissAssetBagRef.current.length === 0) {
          kissAssetBagRef.current = shuffleArray(KISS_MARK_ASSETS)
        }
        const nextAsset = kissAssetBagRef.current.pop() ?? KISS_MARK_ASSETS[0]
        return [...current, createKiss(nextId, nextAsset)]
      })

      queueNextSpawn()
    }, delayMs)
  }

  useEffect(() => {
    if (isRewardTriggered) {
      clearSpawnTimer()
      return
    }

    queueNextSpawn()
    return () => clearSpawnTimer()
  }, [isRewardTriggered])

  useEffect(() => {
    if (kissCount < KISSES_TO_WIN || isRewardTriggered) {
      return
    }

    setIsRewardTriggered(true)
    setShowRewardGlow(true)
    setKisses([])
    clearSpawnTimer()

    if (prefersReducedMotion) {
      setIsCouponOpen(true)
      return
    }

    rewardTimerRef.current = window.setTimeout(() => {
      setIsCouponOpen(true)
      rewardTimerRef.current = null
    }, REWARD_DELAY_MS)
  }, [kissCount, isRewardTriggered, prefersReducedMotion])

  const removeKiss = (kissId: number) => {
    setKisses((current) => current.filter((kiss) => kiss.id !== kissId))
  }

  const addBurst = (clientX: number, clientY: number) => {
    if (!stageRef.current) {
      return
    }

    const bounds = stageRef.current.getBoundingClientRect()
    const burstId = nextBurstIdRef.current
    nextBurstIdRef.current += 1

    setBursts((current) => [
      ...current,
      {
        id: burstId,
        x: clientX - bounds.left,
        y: clientY - bounds.top,
      },
    ])

    const cleanupTimer = window.setTimeout(() => {
      setBursts((current) => current.filter((burst) => burst.id !== burstId))
      burstTimersRef.current = burstTimersRef.current.filter((timerId) => timerId !== cleanupTimer)
    }, BURST_LIFETIME_MS)

    burstTimersRef.current.push(cleanupTimer)
  }

  const catchKiss = (kissId: number, event: React.MouseEvent<HTMLButtonElement>) => {
    if (isRewardTriggered) {
      return
    }

    const targetKiss = kisses.find((kiss) => kiss.id === kissId)
    if (!targetKiss || targetKiss.caught) {
      return
    }

    addBurst(event.clientX, event.clientY)
    setKisses((current) => current.map((kiss) => (kiss.id === kissId ? { ...kiss, caught: true } : kiss)))
    setKissCount((current) => Math.min(KISSES_TO_WIN, current + 1))
  }

  const resetKissDay = () => {
    clearSpawnTimer()
    clearRewardTimer()
    rewardTriggeredRef.current = false
    burstTimersRef.current.forEach((timerId) => window.clearTimeout(timerId))
    burstTimersRef.current = []
    setKisses([])
    setBursts([])
    kissAssetBagRef.current = shuffleArray(KISS_MARK_ASSETS)
    setKissCount(0)
    setIsRewardTriggered(false)
    setShowRewardGlow(false)
    setIsCouponOpen(false)
    queueNextSpawn()
  }

  return (
    <PageLayout backgroundSrc={day.background} title={day.title} showBackButton onBack={() => window.history.back()}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-6 md:gap-8">
        <section className="dreamy-surface px-6 py-7 text-center md:px-10 md:py-8">
          <img src={day.icon} alt="" aria-hidden className="mx-auto h-14 w-14 object-contain md:h-16 md:w-16" />
          <h2 className="mt-4 text-3xl font-semibold text-rich-brown md:text-4xl">Catch My Kisses</h2>
          <p className="mx-auto mt-2 max-w-2xl text-cocoa">
            Your buira is sending you kisses… catch them before they fly away 💗
          </p>
        </section>

        <section className="px-1 py-1 md:px-2 md:py-2">
          <div
            ref={stageRef}
            className="relative mx-auto h-[33rem] w-full max-w-5xl overflow-hidden rounded-3xl border border-white/55 bg-white/35 shadow-dreamy backdrop-blur-sm"
          >
            <img src="/assets/kiss-day/floating-hearts-pack.svg" alt="" aria-hidden className="pointer-events-none absolute left-6 top-8 w-40 opacity-18" />
            <img src="/assets/kiss-day/floating-hearts-pack.svg" alt="" aria-hidden className="pointer-events-none absolute bottom-24 right-6 w-44 opacity-15" />

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
                animate={prefersReducedMotion ? { y: 0, opacity: 0.26 } : { y: [0, -10, 0], opacity: [0.2, 0.4, 0.2] }}
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

            {showRewardGlow ? (
              <div className="pointer-events-none absolute inset-0 z-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,182,193,0.42),rgba(255,182,193,0.12)_50%,transparent_78%)]" />
                {rewardHearts.map((heart) => (
                  <motion.img
                    key={heart.id}
                    src="/assets/ui/heart-small.svg"
                    alt=""
                    aria-hidden
                    className="absolute opacity-75"
                    style={{
                      left: `${heart.left}%`,
                      top: `${heart.top}%`,
                      width: heart.size,
                      height: heart.size,
                    }}
                    initial={{ y: 0, opacity: 0.9, scale: 0.9 }}
                    animate={{ y: -280, opacity: [0.9, 0.95, 0], scale: [0.9, 1.08, 1] }}
                    transition={{
                      duration: heart.duration,
                      delay: heart.delay,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </div>
            ) : null}

            <div className="absolute inset-0 z-30">
              {kisses.map((kiss) => {
                const xPath = kiss.driftPx > 0 ? [0, kiss.driftPx, -kiss.driftPx * 0.45, kiss.driftPx * 0.2, 0] : [0, kiss.driftPx, -kiss.driftPx * 0.45, kiss.driftPx * 0.2, 0]
                const yPath = prefersReducedMotion ? [0, -420] : [0, -120, -250, -380, -520]

                return (
                  <motion.button
                    key={kiss.id}
                    type="button"
                    onClick={(event) => catchKiss(kiss.id, event)}
                    className="absolute left-0 top-0 rounded-full bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soft-rose/80 focus-visible:ring-offset-2"
                    style={{
                      left: `${kiss.xPercent}%`,
                      bottom: '-8%',
                    }}
                    initial={{ opacity: 0, x: 0, y: 0, scale: kiss.scale }}
                    animate={
                      kiss.caught
                        ? {
                            opacity: [1, 1, 0],
                            scale: [kiss.scale, kiss.scale * 1.2, 0.2],
                            y: [0, -14, -22],
                            x: 0,
                          }
                        : {
                            opacity: [0, 1, 1, 0],
                            x: xPath,
                            y: yPath,
                            scale: [kiss.scale, kiss.scale * 1.04, kiss.scale * 0.98, kiss.scale],
                          }
                    }
                    transition={
                      kiss.caught
                        ? { duration: POP_DURATION_SECONDS, ease: 'easeOut' }
                        : {
                            duration: kiss.durationMs / 1000,
                            ease: 'linear',
                          }
                    }
                    onAnimationComplete={() => removeKiss(kiss.id)}
                    aria-label="Catch kiss"
                  >
                    <img src={kiss.assetSrc} alt="" aria-hidden className="h-10 w-10 object-contain md:h-11 md:w-11" />
                  </motion.button>
                )
              })}
            </div>

            <div className="pointer-events-none absolute inset-0 z-40">
              {bursts.map((burst) => (
                <div key={burst.id} className="absolute" style={{ left: burst.x, top: burst.y }}>
                  {[0, 1, 2, 3].map((index) => {
                    const dx = [-16, -6, 6, 16][index]
                    const dy = [-22, -28, -24, -30][index]

                    return (
                      <motion.img
                        key={index}
                        src="/assets/ui/heart-small.svg"
                        alt=""
                        aria-hidden
                        className="absolute h-4 w-4 object-contain"
                        initial={{ x: 0, y: 0, opacity: 0.95, scale: 0.8 }}
                        animate={{ x: dx, y: dy, opacity: 0, scale: 1.15 }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                      />
                    )
                  })}
                </div>
              ))}
            </div>

            {isRewardTriggered ? (
              <div className="pointer-events-none absolute left-1/2 top-[33%] z-50 w-[88%] max-w-xl -translate-x-1/2 text-center">
                <p className="rounded-2xl border border-white/60 bg-white/70 px-4 py-2 text-xl font-semibold text-rich-brown shadow-glow md:text-2xl">
                  You caught all my kisses 😚
                </p>
              </div>
            ) : null}

            <div className="absolute bottom-5 left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 rounded-3xl border border-white/60 bg-cream/85 px-4 py-4 text-center shadow-dreamy backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.15em] text-soft-brown">Love Meter</p>
              <div className="mt-2">
                <KissMeter progress={meterProgress} />
              </div>
              <p className="mt-1 text-sm font-semibold text-rich-brown">
                {kissCount} / {KISSES_TO_WIN} kisses caught
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button variant="secondary" onClick={resetKissDay}>
              Reset Kiss Day
            </Button>
            <Link to={{ pathname: '/', search: location.search, hash: '#roadmap' }}>
              <Button variant="secondary">Back to Home</Button>
            </Link>
          </div>
        </section>
      </div>

      <Modal isOpen={isCouponOpen} onClose={() => setIsCouponOpen(false)} title="Kiss Day Coupon">
        <div className="space-y-5">
          <div ref={couponRef}>
            <CouponCard dayId="kiss-day" title="Kiss Day" rewardText={REWARD_TEXT} />
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
