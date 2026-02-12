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

type AccessoryId = 'heart' | 'bow' | 'flower'

interface AccessoryOption {
  id: AccessoryId
  label: string
  image: string
  rewardPart: string
}

const ACCESSORIES: AccessoryOption[] = [
  {
    id: 'heart',
    label: 'Heart Accessory',
    image: '/assets/teddy-day/teddy-heart-accessory.svg',
    rewardPart: 'heart accessory',
  },
  {
    id: 'bow',
    label: 'Bow Accessory',
    image: '/assets/teddy-day/teddy-bow-accessory.svg',
    rewardPart: 'cute bow',
  },
  {
    id: 'flower',
    label: 'Flower Bouquet',
    image: '/assets/teddy-day/teddy-flower-bouquet-accessory.svg',
    rewardPart: 'flower bouquet',
  },
]

function formatList(items: string[]) {
  if (items.length === 0) {
    return ''
  }

  if (items.length === 1) {
    return items[0]
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`
  }

  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

function buildRewardText(selectedAccessories: AccessoryOption[]) {
  if (selectedAccessories.length === 0) {
    return 'A teddy hug session with your favorite accessories.'
  }

  const parts = selectedAccessories.map((accessory) => accessory.rewardPart)
  return `A teddy hug session with a ${formatList(parts)}.`
}

export default function TeddyDay() {
  const [selectedIds, setSelectedIds] = useState<AccessoryId[]>([])
  const [wiggleKey, setWiggleKey] = useState(0)
  const [isCouponOpen, setIsCouponOpen] = useState(false)
  const couponRef = useRef<HTMLDivElement>(null)
  const openTimerRef = useRef<number | null>(null)
  const { downloadCoupon, isDownloading, error } = useCouponDownload()
  const location = useLocation()
  const debug = parseDebugConfig(location.search)
  const prefersReducedMotion = useReducedMotionPreference()
  const liveNow = useNow()
  const now = debug.debugDate ? getNow(debug) : liveNow
  const day = getDayById('teddy-day')

  const selectedAccessories = useMemo(
    () => ACCESSORIES.filter((accessory) => selectedIds.includes(accessory.id)),
    [selectedIds],
  )
  const hasSelection = selectedAccessories.length > 0
  const selectionSlug = selectedAccessories.map((accessory) => accessory.id).join('-')
  const rewardText = buildRewardText(selectedAccessories)

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

  const toggleAccessory = (accessoryId: AccessoryId) => {
    setSelectedIds((current) =>
      current.includes(accessoryId) ? current.filter((value) => value !== accessoryId) : [...current, accessoryId],
    )
  }

  const onConfirm = () => {
    if (!hasSelection) {
      return
    }

    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current)
      openTimerRef.current = null
    }

    setWiggleKey((value) => value + 1)

    if (prefersReducedMotion) {
      setIsCouponOpen(true)
      return
    }

    openTimerRef.current = window.setTimeout(() => {
      setIsCouponOpen(true)
      openTimerRef.current = null
    }, 520)
  }

  return (
    <PageLayout backgroundSrc={day.background} title={day.title} showBackButton onBack={() => window.history.back()}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-6 md:gap-8">
        <section className="dreamy-surface px-6 py-7 text-center md:px-10 md:py-8">
          <img src={day.icon} alt="" aria-hidden className="mx-auto h-14 w-14 object-contain md:h-16 md:w-16" />
          <h2 className="mt-4 text-3xl font-semibold text-rich-brown md:text-4xl">Style Today&apos;s Teddy</h2>
          <p className="mx-auto mt-2 max-w-2xl text-cocoa">
            Toggle your favorite accessories, then confirm to reveal your Teddy Day coupon.
          </p>
        </section>

        <section className="dreamy-surface px-5 py-6 md:px-8 md:py-8">
          <div className="grid items-start gap-6 lg:grid-cols-[1.15fr_1fr]">
            <div className="rounded-3xl border border-white/65 bg-white/70 p-4 shadow-dreamy">
              <motion.div
                key={wiggleKey}
                className="relative mx-auto aspect-square w-full max-w-[26rem]"
                initial={false}
                animate={
                  !prefersReducedMotion && wiggleKey > 0
                    ? { rotate: [0, -2.5, 2.5, -1.8, 1.8, 0], y: [0, -2, 1, 0] }
                    : { rotate: 0, y: 0 }
                }
                transition={{ duration: prefersReducedMotion ? 0.05 : 0.52, ease: 'easeInOut' }}
              >
                <img src="/assets/teddy-day/teddy-base.svg" alt="Teddy preview" className="h-full w-full object-contain" />

                {selectedIds.includes('bow') ? (
                  <img
                    src="/assets/teddy-day/teddy-bow-accessory.svg"
                    alt=""
                    aria-hidden
                    className="pointer-events-none absolute left-1/2 top-[56%] w-[36%] -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-md"
                  />
                ) : null}

                {selectedIds.includes('flower') ? (
                  <img
                    src="/assets/teddy-day/teddy-flower-bouquet-accessory.svg"
                    alt=""
                    aria-hidden
                    className="pointer-events-none absolute right-[-2%] top-[66%] w-[30%] -translate-y-1/2 object-contain drop-shadow-md"
                  />
                ) : null}

                {selectedIds.includes('heart') ? (
                  <img
                    src="/assets/teddy-day/teddy-heart-accessory.svg"
                    alt=""
                    aria-hidden
                    className="pointer-events-none absolute left-1/2 top-[58%] w-[18%] -translate-x-1/2 object-contain drop-shadow-md"
                  />
                ) : null}
              </motion.div>

              <p className="mt-4 text-center text-sm font-semibold text-rich-brown">
                {hasSelection
                  ? `${selectedAccessories.length} accessory${selectedAccessories.length > 1 ? 'ies' : 'y'} selected`
                  : 'Pick at least one accessory'}
              </p>
            </div>

            <div className="rounded-3xl border border-white/65 bg-white/70 p-4 shadow-dreamy">
              <h3 className="text-center text-lg font-semibold text-rich-brown">Accessories</h3>
              <div className="mt-4 space-y-3">
                {ACCESSORIES.map((accessory) => {
                  const isSelected = selectedIds.includes(accessory.id)

                  return (
                    <button
                      key={accessory.id}
                      type="button"
                      onClick={() => toggleAccessory(accessory.id)}
                      className={clsx(
                        'flex w-full items-center gap-3 rounded-2xl border p-3 text-left shadow-sticker transition',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soft-rose/80 focus-visible:ring-offset-2',
                        isSelected
                          ? 'border-soft-rose bg-soft-rose/20 shadow-glow'
                          : 'border-white/70 bg-white/85 hover:-translate-y-0.5',
                      )}
                      aria-pressed={isSelected}
                    >
                      <img src={accessory.image} alt="" aria-hidden className="h-11 w-11 object-contain" />
                      <div>
                        <p className="text-sm font-semibold text-rich-brown">{accessory.label}</p>
                        <p className="text-xs text-soft-brown">{isSelected ? 'Selected' : 'Tap to add'}</p>
                      </div>
                    </button>
                  )
                })}
              </div>

              <Button className="mt-5 w-full" onClick={onConfirm} disabled={!hasSelection}>
                Confirm Teddy
              </Button>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Link to={{ pathname: '/', search: location.search, hash: '#roadmap' }}>
              <Button variant="secondary">Back to Home</Button>
            </Link>
          </div>
        </section>
      </div>

      <Modal isOpen={isCouponOpen} onClose={() => setIsCouponOpen(false)} title="Teddy Day Coupon">
        <div className="space-y-5">
          <div ref={couponRef}>
            <CouponCard dayId="teddy-day" title="Teddy Day" rewardText={rewardText} />
          </div>

          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsCouponOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                void downloadCoupon(couponRef.current, { dayId: 'teddy-day', selection: selectionSlug || undefined })
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
