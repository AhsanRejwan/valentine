import { memo, useEffect } from 'react'
import clsx from 'clsx'
import { WORD_LAYOUT } from './wordcloudLayout'
import { WORDCLOUD_HEARTS } from './wordcloudHearts'
import { MAIN_WORD, WORDS } from './wordcloudWords'
import './wordcloudStyles.css'

function variantClass(variant: string) {
  if (variant === 'main') return 'wordcloud-main'
  if (variant === 'rose') return 'wordcloud-rose'
  if (variant === 'peach') return 'wordcloud-peach'
  return 'wordcloud-cocoa'
}

function textSizeFactor(text: string) {
  let hash = 0

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) % 104729
  }

  return 0.86 + (hash % 33) / 100
}

function WordCloudView() {
  useEffect(() => {
    const expected = [MAIN_WORD, ...WORDS]
    const layoutWords = WORD_LAYOUT.map((entry) => entry.text)
    const uniqueLayoutWords = new Set(layoutWords)
    const expectedSet = new Set(expected)

    const hasAllWords =
      uniqueLayoutWords.size === expectedSet.size &&
      [...expectedSet].every((word) => uniqueLayoutWords.has(word))

    console.assert(layoutWords.length === 42, `Expected 42 words in layout, got ${layoutWords.length}.`)
    console.assert(hasAllWords, 'WordCloud layout does not match expected words.')
  }, [])

  return (
    <section className="mx-auto w-full max-w-[720px]">
      <div className="relative mx-auto aspect-square w-full max-w-[min(92vw,720px)]">
        <img
          src="/assets/home/wordcloud-heart-mask.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-contain"
        />

        {WORDCLOUD_HEARTS.map((heart, index) => (
          <img
            key={`heart-${index}`}
            src="/assets/ui/heart-small.svg"
            alt=""
            aria-hidden
            className="pointer-events-none absolute object-contain"
            style={{
              left: `${heart.x}%`,
              top: `${heart.y}%`,
              width: `${heart.scale * 18}px`,
              height: `${heart.scale * 18}px`,
              transform: `translate(-50%, -50%) rotate(${heart.rotate}deg)`,
              opacity: heart.opacity,
            }}
          />
        ))}

        {WORD_LAYOUT.map((entry) => {
          const baseFontSize = entry.variant === 'main' ? 40 : 20
          const sizeFactor = entry.variant === 'main' ? 1 : textSizeFactor(entry.text)
          const fontSizePx = baseFontSize * entry.scale * sizeFactor

          return (
            <span
              key={entry.text}
              className={clsx('wordcloud-word', variantClass(entry.variant))}
              style={{
                left: `${entry.x}%`,
                top: `${entry.y}%`,
                fontSize: `${fontSizePx}px`,
                transform: `translate(-50%, -50%) rotate(${entry.rotate}deg)`,
              }}
            >
              {entry.text}
            </span>
          )
        })}
      </div>
    </section>
  )
}

export const WordCloud = memo(WordCloudView)
WordCloud.displayName = 'WordCloud'
