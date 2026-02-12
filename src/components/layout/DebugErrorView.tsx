import { Link } from 'react-router-dom'
import { PageLayout } from './PageLayout'
import { Button } from '../ui/Button'

interface DebugErrorViewProps {
  invalidDayId: string
}

export function DebugErrorView({ invalidDayId }: DebugErrorViewProps) {
  return (
    <PageLayout
      backgroundSrc="/assets/backgrounds/global-dreamy-gradient.svg"
      title="Debug Error"
      showBackButton
      onBack={() => window.history.back()}
    >
      <div className="dreamy-surface w-full max-w-xl p-6 text-center md:p-10">
        <img src="/assets/ui/tooltip-bubble.svg" alt="" aria-hidden className="mx-auto h-16 w-16 object-contain" />
        <h2 className="mt-4 text-2xl font-semibold text-rich-brown md:text-3xl">Invalid debug day</h2>
        <p className="mt-3 text-cocoa">
          The query value <code className="rounded bg-white/70 px-1 py-0.5">debugDay={invalidDayId}</code> is not a
          valid day id.
        </p>
        <div className="mt-7">
          <Link to="/">
            <Button>Go back home</Button>
          </Link>
        </div>
      </div>
    </PageLayout>
  )
}
