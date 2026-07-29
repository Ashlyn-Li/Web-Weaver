import { WEB_CONFIG } from '../config/web'
import type { WebAnchor, WebGraph } from '../types/web'
import { generateCrossHandConnections } from './generateCrossHandConnections'
import { generateHandSupportConnections } from './generateHandSupportConnections'
import { dedupeStrands } from './strandUtils'
import { selectWeaveAnchors } from './selectWeaveAnchors'
import { WebTopologyTracker } from './WebTopologyTracker'

export function generateWeaveWeb(
  anchors: readonly WebAnchor[],
  topologyTracker: WebTopologyTracker,
): WebGraph | null {
  const selectedAnchors = selectWeaveAnchors(anchors)
  const crossHandStrands = generateCrossHandConnections(selectedAnchors)
  const supportStrands = WEB_CONFIG.weave.includeSameHandSupportStrands
    ? generateHandSupportConnections(selectedAnchors)
    : []
  const strands = topologyTracker.preserve(
    dedupeStrands([...crossHandStrands, ...supportStrands]),
  )

  if (selectedAnchors.length === 0 || strands.length === 0) {
    return null
  }

  return {
    mode: 'weave',
    anchors: selectedAnchors,
    strands,
  }
}
