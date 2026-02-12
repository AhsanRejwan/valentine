import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
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

type ChocolateId = 'kitkat' | 'dairy-milk' | 'dark-chocolate' | 'ferrero' | 'snickers'
type SlotId = 'slot-1' | 'slot-2' | 'slot-3' | 'slot-4' | 'slot-5'

interface ChocolateOption {
  id: ChocolateId
  label: string
  image: string
}

const CHOCOLATE_OPTIONS: ChocolateOption[] = [
  { id: 'kitkat', label: 'KitKat', image: '/assets/chocolate-day/kitkat.png' },
  { id: 'dairy-milk', label: 'Dairy Milk', image: '/assets/chocolate-day/dairy-milk.png' },
  { id: 'dark-chocolate', label: 'Dark Chocolate', image: '/assets/chocolate-day/dark-chocolate.png' },
  { id: 'ferrero', label: 'Ferrero', image: '/assets/chocolate-day/ferrero.png' },
  { id: 'snickers', label: 'Snickers', image: '/assets/chocolate-day/snickers.png' },
]

const CHOCOLATE_BY_ID: Record<ChocolateId, ChocolateOption> = {
  kitkat: CHOCOLATE_OPTIONS[0],
  'dairy-milk': CHOCOLATE_OPTIONS[1],
  'dark-chocolate': CHOCOLATE_OPTIONS[2],
  ferrero: CHOCOLATE_OPTIONS[3],
  snickers: CHOCOLATE_OPTIONS[4],
}

const SLOT_IDS: SlotId[] = ['slot-1', 'slot-2', 'slot-3', 'slot-4', 'slot-5']

function createInitialPlacements(): Record<SlotId, ChocolateId | null> {
  return {
    'slot-1': null,
    'slot-2': null,
    'slot-3': null,
    'slot-4': null,
    'slot-5': null,
  }
}

function isChocolateId(value: unknown): value is ChocolateId {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(CHOCOLATE_BY_ID, value)
}

function isSlotId(value: unknown): value is SlotId {
  return typeof value === 'string' && SLOT_IDS.includes(value as SlotId)
}

function formatChocolateList(items: string[]) {
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

interface DraggableChocolateProps {
  option: ChocolateOption
  isPlaced: boolean
  isActive: boolean
}

function DraggableChocolate({ option, isPlaced, isActive }: DraggableChocolateProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: option.id,
    disabled: isPlaced,
  })

  const style = transform
    ? { transform: `translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px, 0)` }
    : undefined

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={clsx(
        'group touch-none rounded-2xl border bg-white/85 p-3 text-left shadow-sticker transition duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soft-rose/80 focus-visible:ring-offset-2',
        isPlaced ? 'cursor-not-allowed border-white/60 opacity-55' : 'cursor-grab border-white/70 hover:-translate-y-1',
        isDragging && 'cursor-grabbing opacity-80 shadow-glow',
        isActive && 'border-soft-rose shadow-glow',
      )}
      style={style}
      disabled={isPlaced}
      aria-label={isPlaced ? `${option.label} already placed` : `Drag ${option.label} to a slot`}
      {...attributes}
      {...listeners}
    >
      <img src={option.image} alt="" aria-hidden className="mx-auto h-14 w-full max-w-[4.4rem] object-contain md:h-16" />
      <p className="mt-2 text-center text-xs font-semibold text-rich-brown md:text-sm">{option.label}</p>
    </button>
  )
}

interface ChocolateSlotProps {
  slotId: SlotId
  assignedChocolate: ChocolateOption | null
  activeChocolateId: ChocolateId | null
  activeAlreadyPlaced: boolean
}

function ChocolateSlot({ slotId, assignedChocolate, activeChocolateId, activeAlreadyPlaced }: ChocolateSlotProps) {
  const { setNodeRef, isOver } = useDroppable({ id: slotId })
  const canAccept = !assignedChocolate && !!activeChocolateId && !activeAlreadyPlaced

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        'relative flex h-24 items-center justify-center rounded-2xl border border-dashed bg-white/72 p-2 shadow-inner transition md:h-28',
        assignedChocolate ? 'border-soft-brown/50 bg-white/82' : 'border-soft-brown/35',
        isOver && canAccept && 'border-soft-gold bg-soft-gold/25',
        isOver && !canAccept && 'border-soft-rose/60 bg-soft-rose/20',
      )}
      aria-label={`Chocolate box ${slotId}`}
    >
      {assignedChocolate ? (
        <img src={assignedChocolate.image} alt={assignedChocolate.label} className="h-16 w-full max-w-[4.8rem] object-contain md:h-20" />
      ) : (
        <p className="text-[11px] font-semibold uppercase tracking-wide text-soft-brown md:text-xs">Drop Here</p>
      )}
    </div>
  )
}

export default function ChocolateDay() {
  const [placements, setPlacements] = useState<Record<SlotId, ChocolateId | null>>(() => createInitialPlacements())
  const [activeChocolateId, setActiveChocolateId] = useState<ChocolateId | null>(null)
  const [hasTriggeredCompletion, setHasTriggeredCompletion] = useState(false)
  const [isCouponOpen, setIsCouponOpen] = useState(false)
  const couponRef = useRef<HTMLDivElement>(null)
  const completionTimerRef = useRef<number | null>(null)
  const { downloadCoupon, isDownloading, error } = useCouponDownload()
  const location = useLocation()
  const debug = parseDebugConfig(location.search)
  const prefersReducedMotion = useReducedMotionPreference()
  const liveNow = useNow()
  const now = debug.debugDate ? getNow(debug) : liveNow
  const day = getDayById('chocolate-day')

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 6 },
    }),
  )

  const usedChocolateIds = new Set<ChocolateId>()
  for (const slotId of SLOT_IDS) {
    const chocolateId = placements[slotId]
    if (chocolateId) {
      usedChocolateIds.add(chocolateId)
    }
  }

  const activeAlreadyPlaced = activeChocolateId ? usedChocolateIds.has(activeChocolateId) : false
  const isComplete = usedChocolateIds.size === SLOT_IDS.length
  const selectedLabels = SLOT_IDS.map((slotId) => placements[slotId])
    .filter((value): value is ChocolateId => value !== null)
    .map((chocolateId) => CHOCOLATE_BY_ID[chocolateId].label)
  const rewardText = isComplete
    ? `A hand-picked chocolate box with ${formatChocolateList(selectedLabels)} waiting for our date.`
    : 'A hand-picked chocolate box waiting for our date.'

  useEffect(() => {
    return () => {
      if (completionTimerRef.current !== null) {
        window.clearTimeout(completionTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!isComplete || hasTriggeredCompletion) {
      return
    }

    setHasTriggeredCompletion(true)

    if (prefersReducedMotion) {
      setIsCouponOpen(true)
      return
    }

    completionTimerRef.current = window.setTimeout(() => {
      setIsCouponOpen(true)
      completionTimerRef.current = null
    }, 480)
  }, [hasTriggeredCompletion, isComplete, prefersReducedMotion])

  if (debug.invalidDayId) {
    return <DebugErrorView invalidDayId={debug.invalidDayId} />
  }

  if (!isUnlocked(day.id, now, debug)) {
    return <LockedView title={day.title} unlockAt={getDayUnlockAt(day.id, now)} backgroundSrc={day.background} />
  }

  const onDragStart = (event: DragStartEvent) => {
    if (!isChocolateId(event.active.id)) {
      setActiveChocolateId(null)
      return
    }

    setActiveChocolateId(event.active.id)
  }

  const onDragEnd = (event: DragEndEvent) => {
    setActiveChocolateId(null)

    if (!isChocolateId(event.active.id)) {
      return
    }

    if (!event.over || !isSlotId(event.over.id)) {
      return
    }

    const chocolateId = event.active.id
    const slotId = event.over.id

    setPlacements((current) => {
      const alreadyPlaced = SLOT_IDS.some((existingSlotId) => current[existingSlotId] === chocolateId)
      if (alreadyPlaced || current[slotId] !== null) {
        return current
      }

      return {
        ...current,
        [slotId]: chocolateId,
      }
    })
  }

  const resetBox = () => {
    if (completionTimerRef.current !== null) {
      window.clearTimeout(completionTimerRef.current)
      completionTimerRef.current = null
    }

    setPlacements(createInitialPlacements())
    setActiveChocolateId(null)
    setHasTriggeredCompletion(false)
    setIsCouponOpen(false)
  }

  return (
    <PageLayout backgroundSrc={day.background} title={day.title} showBackButton onBack={() => window.history.back()}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-6 md:gap-8">
        <section className="dreamy-surface px-6 py-7 text-center md:px-10 md:py-8">
          <img src={day.icon} alt="" aria-hidden className="mx-auto h-14 w-14 object-contain md:h-16 md:w-16" />
          <h2 className="mt-4 text-3xl font-semibold text-rich-brown md:text-4xl">Build Your Chocolate Box</h2>
          <p className="mx-auto mt-2 max-w-2xl text-cocoa">
            Drag all five chocolates into the box. One of each only, then your coupon unlocks.
          </p>
          <p className="mt-3 text-sm text-soft-brown">Scheduled unlock: {formatDateTime(getDayUnlockAt(day.id, now))}</p>
        </section>

        <section className="dreamy-surface px-5 py-6 md:px-8 md:py-8">
          <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setActiveChocolateId(null)}>
            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <div className="relative rounded-3xl border border-white/65 bg-cream/65 p-4 shadow-dreamy">
                <img src="/assets/chocolate-day/choco-box.svg" alt="" aria-hidden className="h-24 w-full object-contain opacity-70 md:h-28" />

                {isComplete ? (
                  <img
                    src="/assets/ui/confetti-hearts-set.svg"
                    alt=""
                    aria-hidden
                    className={clsx(
                      'pointer-events-none absolute inset-2 h-[calc(100%-1rem)] w-[calc(100%-1rem)] object-cover opacity-55',
                      !prefersReducedMotion && 'animate-pulse-glow-soft',
                    )}
                  />
                ) : null}

                <div className="relative z-10 mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {SLOT_IDS.map((slotId) => {
                    const chocolateId = placements[slotId]
                    const assignedChocolate = chocolateId ? CHOCOLATE_BY_ID[chocolateId] : null

                    return (
                      <ChocolateSlot
                        key={slotId}
                        slotId={slotId}
                        assignedChocolate={assignedChocolate}
                        activeChocolateId={activeChocolateId}
                        activeAlreadyPlaced={activeAlreadyPlaced}
                      />
                    )
                  })}
                </div>

                <p className="relative z-10 mt-4 text-center text-sm font-semibold text-rich-brown">
                  {isComplete
                    ? 'Perfect box complete. Your coupon is ready.'
                    : `${usedChocolateIds.size} / ${SLOT_IDS.length} chocolates placed`}
                </p>
              </div>

              <div className="rounded-3xl border border-white/65 bg-white/70 p-4 shadow-dreamy">
                <h3 className="text-center text-lg font-semibold text-rich-brown">Chocolate Tray</h3>
                <p className="mt-1 text-center text-xs uppercase tracking-wide text-soft-brown">Drag to box slots</p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {CHOCOLATE_OPTIONS.map((option) => (
                    <DraggableChocolate
                      key={option.id}
                      option={option}
                      isPlaced={usedChocolateIds.has(option.id)}
                      isActive={activeChocolateId === option.id}
                    />
                  ))}
                </div>
              </div>
            </div>
          </DndContext>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button variant="secondary" onClick={resetBox}>
              Reset Box
            </Button>
            <Link to={`/${location.search}`}>
              <Button variant="secondary">Back to Home</Button>
            </Link>
          </div>
        </section>
      </div>

      <Modal isOpen={isCouponOpen} onClose={() => setIsCouponOpen(false)} title="Chocolate Day Coupon">
        <div className="space-y-5">
          <div ref={couponRef}>
            <CouponCard dayId="chocolate-day" title="Chocolate Day" rewardText={rewardText} />
          </div>

          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsCouponOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                void downloadCoupon(couponRef.current, { dayId: 'chocolate-day', selection: 'custom-box' })
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
