import { WEB_CONFIG } from '../config/web'
import type { WebAnchor } from '../types/web'

const WEAVE_ANCHOR_ORDER = [
  'thumb-tip',
  'index-tip',
  'middle-tip',
  'ring-tip',
  'little-tip',
  'palm-centre',
] as const

function getAnchorPriority(anchor: WebAnchor) {
  const index = WEAVE_ANCHOR_ORDER.findIndex((anchorName) => anchorName === anchor.anchorName)

  return index === -1 ? WEAVE_ANCHOR_ORDER.length : index
}

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
        const priorityDifference = getAnchorPriority(first) - getAnchorPriority(second)

        return priorityDifference === 0
          ? first.id.localeCompare(second.id)
          : priorityDifference
      })
      .slice(0, WEB_CONFIG.weave.maximumAnchorsPerHand),
  )
}
