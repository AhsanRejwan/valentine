import type { DayId } from '../../config/days'

interface CouponCardProps {
  dayId: DayId
  title: string
  rewardText: string
}

const SIGNATURES = [
  'your buira',
  'your gadhu',
  'your idiot',
  'your chhagol',
  'yours truly',
  'your loves you like crazy guy',
  'your man',
  'yours forever',
] as const

function getSignature(dayId: DayId) {
  const index = dayId.split('').reduce((accumulator, value) => accumulator + value.charCodeAt(0), 0) % SIGNATURES.length
  return SIGNATURES[index]
}

export function CouponCard({ dayId, title, rewardText }: CouponCardProps) {
  const signature = getSignature(dayId)

  return (
    <div className="mx-auto w-full max-w-[560px] rounded-3xl border border-white/60 bg-cream/80 p-4 shadow-dreamy md:p-6">
      <div className="relative overflow-hidden rounded-2xl border border-soft-brown/35 bg-white/90 px-5 py-6 text-rich-brown">
        <img
          src="/assets/coupons/coupon-base-template.svg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-soft-brown">Redeemable Coupon</p>
          <h4 className="mt-2 text-2xl font-semibold md:text-3xl">{title}</h4>
          <img src="/assets/coupons/coupon-divider.svg" alt="" aria-hidden className="mt-4 w-full object-contain" />

          <p className="mt-4 text-base leading-relaxed text-cocoa md:text-lg">{rewardText}</p>

          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="text-sm text-soft-brown">
              made with love,
              <br />
              <span className="font-semibold text-rich-brown">{signature}</span>
            </p>
            <img
              src="/assets/coupons/coupon-stamp-redeemable.svg"
              alt=""
              aria-hidden
              className="h-16 w-16 object-contain opacity-90"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
