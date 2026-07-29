import { WEB_CONFIG } from '../config/web'
import { distance } from '../geometry/vector3'
import type { WebAnchor, WebStrand } from '../types/web'

export function getStrandId(startId: string, endId: string) {
  return [startId, endId].sort().join('--')
}

export function createStrand(
  start: WebAnchor,
  end: WebAnchor,
  kind: WebStrand['kind'],
  thickness: number = WEB_CONFIG.rendering.baseThickness,
  opacity: number = WEB_CONFIG.rendering.baseOpacity,
): WebStrand | null {
  const length = distance(start, end)

  if (
    length < WEB_CONFIG.geometry.minimumStrandLength ||
    length > WEB_CONFIG.geometry.maximumStrandLength
  ) {
    return null
  }

  return {
    id: getStrandId(start.id, end.id),
    startId: start.id,
    endId: end.id,
    tension: Math.min(1, length / WEB_CONFIG.geometry.maximumStrandLength),
    thickness,
    opacity,
    kind,
  }
}

export function dedupeStrands(strands: readonly WebStrand[]) {
  return Array.from(new Map(strands.map((strand) => [strand.id, strand])).values())
}
