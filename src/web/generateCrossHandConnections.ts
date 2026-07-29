import { WEB_CONFIG } from '../config/web'
import type { WebAnchor, WebStrand } from '../types/web'
import { createStrand, dedupeStrands } from './strandUtils'

export function generateCrossHandConnections(
  anchors: readonly WebAnchor[],
): WebStrand[] {
  const hands = Array.from(
    anchors.reduce<Map<string, WebAnchor[]>>((groups, anchor) => {
      if (anchor.handId) {
        groups.set(anchor.handId, [...(groups.get(anchor.handId) ?? []), anchor])
      }

      return groups
    }, new Map()).values(),
  )

  if (hands.length < 2) {
    return []
  }

  const [firstHand, secondHand] = hands
  const strands: WebStrand[] = []
  const addConnection = (firstAnchor?: WebAnchor, secondAnchor?: WebAnchor) => {
    if (!firstAnchor || !secondAnchor) {
      return
    }

    const strand = createStrand(firstAnchor, secondAnchor, 'cross-hand')

    if (strand) {
      strands.push(strand)
    }
  }

  firstHand.forEach((anchor) => {
    const matchingAnchor = secondHand.find(
      (otherAnchor) => otherAnchor.anchorName === anchor.anchorName,
    )
    addConnection(anchor, matchingAnchor)
  })

  firstHand.forEach((anchor, index) => {
    addConnection(anchor, secondHand[index + 1])
  })

  return dedupeStrands(strands).slice(
    0,
    Math.max(
      WEB_CONFIG.weave.minimumCrossHandConnections,
      WEB_CONFIG.weave.maximumCrossHandConnections,
    ),
  )
}
