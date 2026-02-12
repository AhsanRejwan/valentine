import { useLocation } from 'react-router-dom'
import { PageLayout } from '../components/layout/PageLayout'
import { DebugErrorView } from '../components/layout/DebugErrorView'
// import { WordCloud } from '../components/wordcloud/WordCloud'
import { CountdownPill } from '../components/layout/CountdownPill'
import { Roadmap } from '../components/layout/Roadmap'
import { parseDebugConfig } from '../utils/debug'
import { getNextUnlock, getNow } from '../utils/unlock'
import { useNow } from '../hooks/useNow'

export default function Home() {
  const location = useLocation()
  const debug = parseDebugConfig(location.search)
  const liveNow = useNow()
  const now = debug.debugDate ? getNow(debug) : liveNow

  if (debug.invalidDayId) {
    return <DebugErrorView invalidDayId={debug.invalidDayId} />
  }

  const nextUnlock = getNextUnlock(now, debug)

  return (
    <PageLayout
      backgroundSrc="/assets/backgrounds/global-dreamy-gradient.svg"
      title="Valentine's Week"
      showBackButton={false}
      contentClassName="items-start"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 pb-6 md:gap-10">
        <section className="dreamy-surface px-6 py-7 text-center md:px-10 md:py-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-soft-brown">Welcome, Mi Amor</p>
          <h2 className="mt-2 text-3xl font-semibold text-rich-brown md:text-5xl">Every Day, A New Surprise</h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-cocoa md:text-lg">
            One unlocked moment at a time, from Rose Day to Valentine&apos;s Day.
          </p>
          {location.search ? (
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-soft-brown">Debug mode active</p>
          ) : null}
        </section>

        {/* <WordCloud /> */}
        <section className="home-wordcloud-shell mx-auto w-full max-w-4xl">
          <div className="home-wordcloud-stage">
            <img
              src="/assets/home/vaelntine-wordcloud.svg"
              alt="Valentine word cloud preview"
              className="home-wordcloud-static mx-auto h-auto w-full"
            />
          </div>
        </section>

        <CountdownPill nextUnlock={nextUnlock} />

        <Roadmap now={now} debug={debug} query={location.search} />
      </div>
    </PageLayout>
  )
}
