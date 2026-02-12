import { Link } from 'react-router-dom'
import { PageLayout } from './PageLayout'
import { Button } from '../ui/Button'
import { useNow } from '../../hooks/useNow'
import { formatCountdown, formatDateTime } from '../../utils/time'

interface LockedViewProps {
  title: string
  unlockAt: Date
  backgroundSrc: string
}

export function LockedView({ title, unlockAt, backgroundSrc }: LockedViewProps) {
  const now = useNow()
  const msRemaining = Math.max(0, unlockAt.getTime() - now.getTime())

  return (
    <PageLayout backgroundSrc={backgroundSrc} title={title} showBackButton onBack={() => window.history.back()}>
      <div className="dreamy-surface w-full max-w-xl p-6 text-center md:p-10">
        <img
          src="/assets/ui/lock-icon.svg"
          alt="Locked day"
          className="mx-auto h-16 w-16 object-contain md:h-20 md:w-20"
        />
        <h2 className="mt-4 text-2xl font-semibold text-rich-brown md:text-3xl">{title} is still locked</h2>
        <p className="mt-3 text-cocoa">Come back when the countdown ends.</p>
        <p className="mt-4 text-3xl font-semibold text-rich-brown">{formatCountdown(msRemaining)}</p>
        <p className="mt-2 text-sm text-soft-brown">Unlocks at {formatDateTime(unlockAt)}</p>

        <div className="mt-7">
          <Link to="/">
            <Button variant="secondary">Back to Home</Button>
          </Link>
        </div>
      </div>
    </PageLayout>
  )
}
