import { WEB_CONFIG } from '../config/web'
import type { WebAnchor } from '../types/web'

export function selectWeaveAnchors(anchors: readonly WebAnchor[]) {
  const byHand = new Map<string, WebAnchor[]>()

  anchors.forEach((anchor) => {
    if (!anchor.handId) {
      return
    }

    byHand.set(anchor.handId, [...(byHand.get(anchor.handId) ?? []), anchor])
  })

  return Array.from(byHand.values()).flatMap((handAnchors) =>
    handAnchors
      .filter(
        (anchor) =>
          WEB_CONFIG.weave.includePalmCentres || anchor.source !== 'palm-centre',
      )
      .sort((first, second) => {
        if (first.source === 'palm-centre') {
          return 1
        }

        if (second.source === 'palm-centre') {
          return -1
        }

        return first.id.localeCompare(second.id)
      })
      .slice(0, WEB_CONFIG.weave.maximumAnchorsPerHand),
  )
}
