import { useCallback, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'

const AUDIO_SRC = encodeURI('/assets/audio/Until I Found You - Stephen Sanchez - Cover (Violin).mp3')
const DEFAULT_VOLUME = 0.45
const VOLUME_STEP = 0.1

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function SoundIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4">
      <path
        d="M3.5 9.5h4.3l4.4-3.6v12.2l-4.4-3.6H3.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {muted ? (
        <path d="M16 9l5 6M21 9l-5 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      ) : (
        <>
          <path
            d="M16 9.5c1.4 1.4 1.4 3.6 0 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M18.8 7.2c2.7 2.7 2.7 6.9 0 9.6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  )
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4">
      <path d="M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4">
      <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function BackgroundAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [volume, setVolume] = useState(DEFAULT_VOLUME)
  const [isMuted, setIsMuted] = useState(false)
  const [awaitingInteraction, setAwaitingInteraction] = useState(false)

  const ensurePlayback = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) {
      return false
    }

    if (!audio.paused) {
      return true
    }

    try {
      await audio.play()
      return true
    } catch {
      return false
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) {
      return
    }

    audio.volume = volume
    audio.muted = isMuted
  }, [isMuted, volume])

  useEffect(() => {
    let unmounted = false

    const tryAutoStart = async () => {
      const started = await ensurePlayback()
      if (!unmounted) {
        setAwaitingInteraction(!started)
      }
    }

    void tryAutoStart()

    return () => {
      unmounted = true
    }
  }, [ensurePlayback])

  useEffect(() => {
    if (!awaitingInteraction) {
      return
    }

    const tryStartOnInteraction = async () => {
      const started = await ensurePlayback()
      if (started) {
        setAwaitingInteraction(false)
      }
    }

    window.addEventListener('pointerdown', tryStartOnInteraction)
    window.addEventListener('touchstart', tryStartOnInteraction)
    window.addEventListener('keydown', tryStartOnInteraction)

    return () => {
      window.removeEventListener('pointerdown', tryStartOnInteraction)
      window.removeEventListener('touchstart', tryStartOnInteraction)
      window.removeEventListener('keydown', tryStartOnInteraction)
    }
  }, [awaitingInteraction, ensurePlayback])

  const updateVolume = (nextVolume: number) => {
    const safeVolume = clamp(nextVolume, 0, 1)
    setVolume(safeVolume)
    setIsMuted(safeVolume === 0)
    void ensurePlayback()
  }

  const toggleMute = () => {
    setIsMuted((currentMuted) => {
      const nextMuted = !currentMuted
      if (!nextMuted && volume <= 0) {
        setVolume(DEFAULT_VOLUME)
      }
      return nextMuted
    })
    void ensurePlayback()
  }

  return (
    <>
      <audio ref={audioRef} src={AUDIO_SRC} loop preload="auto" />

      <div className="fixed right-3 top-3 z-[70] md:right-4 md:top-4">
        <div className="rounded-2xl border border-white/65 bg-white/82 px-3 py-2 shadow-dreamy backdrop-blur-md">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              className={clsx(
                'inline-flex h-9 w-9 items-center justify-center rounded-full border text-rich-brown transition',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soft-rose/80 focus-visible:ring-offset-2',
                isMuted ? 'border-soft-rose bg-soft-rose/20' : 'border-white/70 bg-white/90 hover:bg-white',
              )}
              aria-label={isMuted ? 'Unmute background music' : 'Mute background music'}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              <SoundIcon muted={isMuted} />
            </button>

            <button
              type="button"
              onClick={() => updateVolume(volume - VOLUME_STEP)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/90 text-rich-brown transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soft-rose/80 focus-visible:ring-offset-2"
              aria-label="Lower music volume"
              title="Volume down"
            >
              <MinusIcon />
            </button>

            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(volume * 100)}
              onChange={(event) => updateVolume(Number(event.target.value) / 100)}
              className="h-2 w-20 cursor-pointer accent-soft-rose md:w-24"
              aria-label="Background music volume"
            />

            <button
              type="button"
              onClick={() => updateVolume(volume + VOLUME_STEP)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/90 text-rich-brown transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soft-rose/80 focus-visible:ring-offset-2"
              aria-label="Increase music volume"
              title="Volume up"
            >
              <PlusIcon />
            </button>
          </div>

          {awaitingInteraction ? (
            <p className="mt-2 text-center text-[11px] font-semibold uppercase tracking-wide text-soft-brown">
              Tap anywhere to start music
            </p>
          ) : null}
        </div>
      </div>
    </>
  )
}
