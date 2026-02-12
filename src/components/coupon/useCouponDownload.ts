import { useCallback, useState } from 'react'
import { toPng } from 'html-to-image'
import type { DayId } from '../../config/days'

interface DownloadOptions {
  dayId: DayId
  selection?: string
}

function sanitizeSelection(selection: string) {
  return selection.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export function useCouponDownload() {
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const downloadCoupon = useCallback(async (node: HTMLElement | null, options: DownloadOptions) => {
    if (!node) {
      setError('Coupon preview is not ready yet.')
      return
    }

    setIsDownloading(true)
    setError(null)

    try {
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: '#fff',
        skipFonts: true,
      })

      const selectionSlug = options.selection ? sanitizeSelection(options.selection) : ''
      const fileName = selectionSlug
        ? `coupon-${options.dayId}-${selectionSlug}.png`
        : `coupon-${options.dayId}.png`

      const link = document.createElement('a')
      link.href = dataUrl
      link.download = fileName
      link.click()
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : 'Failed to download coupon.')
    } finally {
      setIsDownloading(false)
    }
  }, [])

  return { downloadCoupon, isDownloading, error }
}
