import clsx from 'clsx'
import { useReducedMotionPreference } from '../../hooks/useReducedMotionPreference'

type StickerAnimation = 'float' | 'sway' | 'none'
type StickerSize = 'sm' | 'md' | 'lg'

interface StickerProps {
  src: string
  alt: string
  animation?: StickerAnimation
  size?: StickerSize
  className?: string
}

const SIZE_STYLES: Record<StickerSize, string> = {
  sm: 'h-16 w-16 md:h-20 md:w-20',
  md: 'h-24 w-24 md:h-28 md:w-28',
  lg: 'h-32 w-32 md:h-40 md:w-40',
}

const ANIMATION_STYLES: Record<Exclude<StickerAnimation, 'none'>, string> = {
  float: 'animate-float-soft',
  sway: 'animate-sway-soft',
}

export function Sticker({ src, alt, animation = 'none', size = 'md', className }: StickerProps) {
  const prefersReducedMotion = useReducedMotionPreference()
  const animationClass =
    animation === 'none' || prefersReducedMotion ? undefined : ANIMATION_STYLES[animation]

  return (
    <div
      className={clsx(
        'inline-flex items-center justify-center rounded-3xl border border-white/60 bg-white/70 p-3 shadow-sticker backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:scale-[1.03]',
        SIZE_STYLES[size],
        animationClass,
        className,
      )}
    >
      <img src={src} alt={alt} className="h-full w-full object-contain" />
    </div>
  )
}
