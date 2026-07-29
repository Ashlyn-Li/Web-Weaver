import { WEB_CONFIG } from '../config/web'
import { distance } from '../geometry/vector3'
import type { WebAnchorCandidate } from '../types/interaction'
import type { WebAnchor } from '../types/web'

function getHandKey(handId: string) {
  return handId.toLowerCase()
}

function getAnchorId(candidate: WebAnchorCandidate) {
  return `${getHandKey(candidate.handId)}:${candidate.name}`
}

function isValidCoordinate(value: number) {
  return Number.isFinite(value) && value >= -0.5 && value <= 1.5
}

function isValidAnchor(anchor: WebAnchor) {
  return (
    isValidCoordinate(anchor.x) &&
    isValidCoordinate(anchor.y) &&
    Number.isFinite(anchor.z)
  )
}

export function createWebAnchors(
  candidates: readonly WebAnchorCandidate[],
): WebAnchor[] {
  return candidates.reduce<WebAnchor[]>((anchors, candidate) => {
    const anchor: WebAnchor = {
      id: getAnchorId(candidate),
      x: candidate.position.x,
      y: candidate.position.y,
      z: candidate.position.z,
      source: candidate.landmarkIndex === null ? 'palm-centre' : 'hand-landmark',
      handId: candidate.handId,
      anchorName: candidate.name,
    }

    if (
      !isValidAnchor(anchor) ||
      anchors.some(
        (existingAnchor) =>
          existingAnchor.id === anchor.id ||
          distance(existingAnchor, anchor) <
            WEB_CONFIG.geometry.duplicateDistanceThreshold,
      )
    ) {
      return anchors
    }

    anchors.push(anchor)
    return anchors
  }, [])
}
