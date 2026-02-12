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
            className={clsx('relative w-full max-w-3xl', className)}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: prefersReducedMotion ? 0.05 : 0.2, ease: 'easeOut' }}
          >
            <div className="rounded-[2.2rem] bg-white p-2 shadow-dreamy">
              <div className="rounded-[2rem] border-[10px] border-cocoa bg-gradient-to-b from-[#ffe8f0]/75 via-cream/70 to-[#ffe8f0]/75 p-1">
                <div className="relative overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/45 px-8 pb-9 pt-10 md:px-12 md:pb-10 md:pt-12">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-white/20" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-rich-brown/5" />

                  <img
                    src="/assets/ui/heart-small.svg"
                    alt=""
                    aria-hidden
                    className="pointer-events-none absolute left-4 top-3 h-4 w-4 opacity-65"
                  />
                  <img
                    src="/assets/ui/heart-small.svg"
                    alt=""
                    aria-hidden
                    className="pointer-events-none absolute right-4 top-3 h-4 w-4 opacity-65"
                  />
                  <img
                    src="/assets/ui/heart-small.svg"
                    alt=""
                    aria-hidden
                    className="pointer-events-none absolute bottom-3 left-4 h-4 w-4 opacity-65"
                  />
                  <img
                    src="/assets/ui/heart-small.svg"
                    alt=""
                    aria-hidden
                    className="pointer-events-none absolute bottom-3 right-4 h-4 w-4 opacity-65"
                  />

                  <div className="relative z-10">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      {title ? <h3 className="text-xl font-semibold text-rich-brown md:text-2xl">{title}</h3> : <span />}
                      <button
                        type="button"
                        onClick={onClose}
                        className="group relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-gradient-to-b from-white/90 to-cream/85 shadow-sticker transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soft-rose/80"
                        aria-label="Close"
                      >
                        <span
                          aria-hidden
                          className="absolute h-[2px] w-4 rotate-45 rounded bg-rich-brown transition group-hover:bg-cocoa"
                        />
                        <span
                          aria-hidden
                          className="absolute h-[2px] w-4 -rotate-45 rounded bg-rich-brown transition group-hover:bg-cocoa"
                        />
                      </button>
                    </div>
                    {children}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
