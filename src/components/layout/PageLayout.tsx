import type { ReactNode } from 'react'
import clsx from 'clsx'

interface PageLayoutProps {
  backgroundSrc: string
  backgroundAlt?: string
  title?: string
  showBackButton?: boolean
  onBack?: () => void
  overlays?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
}

export function PageLayout({
  backgroundSrc,
  backgroundAlt = '',
  title,
  showBackButton = false,
  onBack,
  overlays,
  children,
  className,
  contentClassName,
}: PageLayoutProps) {
  return (
    <div className={clsx('relative isolate min-h-screen overflow-hidden', className)}>
      <img
        src={backgroundSrc}
        alt={backgroundAlt}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      {overlays ? <div className="pointer-events-none absolute inset-0">{overlays}</div> : null}

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 md:px-8 md:py-8">
        <header className="flex min-h-12 items-center justify-between">
          <div className="flex items-center gap-3">
            {showBackButton ? (
              <button
                type="button"
                onClick={onBack}
                className="rounded-full border border-white/65 bg-white/75 px-4 py-2 text-sm font-semibold text-rich-brown shadow-glow backdrop-blur-sm transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soft-rose/80 focus-visible:ring-offset-2"
              >
                Back
              </button>
            ) : null}
            {title ? <h1 className="text-xl font-semibold text-rich-brown md:text-2xl">{title}</h1> : null}
          </div>
        </header>

        <main className={clsx('flex flex-1 items-center justify-center py-6 md:py-10', contentClassName)}>
          {children}
        </main>
      </div>
    </div>
  )
}
