import { PageLayout } from './components/layout/PageLayout'
import { Sticker } from './components/layout/Sticker'
import { Button } from './components/ui/Button'
import { useReducedMotionPreference } from './hooks/useReducedMotionPreference'

function App() {
  const prefersReducedMotion = useReducedMotionPreference()

  return (
    <PageLayout
      title="Valentine Week"
      backgroundSrc="/assets/backgrounds/global-dreamy-gradient.svg"
      backgroundAlt="Soft dreamy gradient background"
      showBackButton
      onBack={() =>
        window.scrollTo({
          top: 0,
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        })
      }
    >
      <div className="dreamy-surface w-full max-w-3xl p-6 text-center md:p-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-soft-brown">Phase 2 Demo</p>
        <h2 className="mt-2 text-3xl font-semibold text-rich-brown md:text-4xl">Theme + Core Layout Components</h2>
        <p className="mx-auto mt-3 max-w-xl text-base text-cocoa">
          Shared layout primitives are now in place with soft styling, reusable buttons, and reduced motion support.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Sticker src="/assets/icons/rose.svg" alt="Rose sticker" animation="float" />
          <Sticker src="/assets/icons/ring.svg" alt="Ring sticker" animation="sway" />
          <Sticker src="/assets/icons/chocolate.svg" alt="Chocolate sticker" animation="float" />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button>Primary Action</Button>
          <Button variant="secondary">Secondary Action</Button>
        </div>

        <p className="mt-6 text-sm text-soft-brown">
          Reduced motion: {prefersReducedMotion ? 'enabled' : 'disabled'}
        </p>
      </div>
    </PageLayout>
  )
}

export default App
