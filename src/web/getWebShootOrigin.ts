import { WEB_CONFIG } from '../config/web'
import type { ProcessedHand } from '../types/hand'
import type { WebAnchor } from '../types/web'
import { HAND_LANDMARKS } from '../vision/handLandmarks'
import { getLandmark } from '../vision/landmarkUtils'

export function getWebShootOrigin(hand: ProcessedHand): WebAnchor | null {
  const wrist = getLandmark(hand.landmarks, HAND_LANDMARKS.WRIST)
  const middleMcp = getLandmark(hand.landmarks, HAND_LANDMARKS.MIDDLE_MCP)

  if (!wrist || !middleMcp) {
    return null
  }

  return {
    id: `${hand.id.toLowerCase()}:${WEB_CONFIG.shoot.originAnchor}`,
    x: wrist.x * 0.7 + middleMcp.x * 0.3,
    y: wrist.y * 0.7 + middleMcp.y * 0.3,
    z: wrist.z * 0.7 + middleMcp.z * 0.3,
    source: 'hand-landmark',
    handId: hand.id,
    anchorName: WEB_CONFIG.shoot.originAnchor,
  }
}
