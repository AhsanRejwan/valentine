import { useEffect, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'
import { useReducedMotionPreference } from '../../hooks/useReducedMotionPreference'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  const prefersReducedMotion = useReducedMotionPreference()

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-rich-brown/45 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              onClose()
            }
          }}
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.05 : 0.18 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title ?? 'Modal'}
            className={clsx(
              'relative w-full max-w-3xl overflow-hidden rounded-[2.2rem] shadow-dreamy',
              className,
            )}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: prefersReducedMotion ? 0.05 : 0.2, ease: 'easeOut' }}
          >
            <img
              src="/assets/ui/modal-frame.svg"
              alt=""
              aria-hidden
              className="pointer-events-none absolute inset-0 h-full w-full object-fill"
            />
            <div className="relative z-10 bg-white/10 px-8 pb-9 pt-10 md:px-12 md:pb-10 md:pt-12">
              <div className="mb-5 flex items-start justify-between gap-4">
                {title ? <h3 className="text-xl font-semibold text-rich-brown md:text-2xl">{title}</h3> : <span />}
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full bg-white/80 p-2 shadow-sticker transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soft-rose/80"
                  aria-label="Close"
                >
                  <img src="/assets/ui/close-heart.svg" alt="" aria-hidden className="h-7 w-7 object-contain" />
                </button>
              </div>
              {children}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
