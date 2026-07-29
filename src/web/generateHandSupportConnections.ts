import type { WebAnchor, WebStrand } from '../types/web'
import { createStrand, dedupeStrands } from './strandUtils'

export function generateHandSupportConnections(
  anchors: readonly WebAnchor[],
): WebStrand[] {
  const hands = anchors.reduce<Map<string, WebAnchor[]>>((groups, anchor) => {
    if (anchor.handId) {
      groups.set(anchor.handId, [...(groups.get(anchor.handId) ?? []), anchor])
    }

    return groups
  }, new Map())
  const strands: WebStrand[] = []

  hands.forEach((handAnchors) => {
    const palmAnchor = handAnchors.find((anchor) => anchor.source === 'palm-centre')

    if (!palmAnchor) {
      return
    }

    handAnchors
      .filter((anchor) => anchor.id !== palmAnchor.id)
      .forEach((anchor) => {
        const strand = createStrand(palmAnchor, anchor, 'support', 1.1, 0.52)

        if (strand) {
          strands.push(strand)
        }
      })
  })

  return dedupeStrands(strands)
}
