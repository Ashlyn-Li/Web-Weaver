import { WEB_CONFIG } from '../config/web'
import type { ProcessedHand } from '../types/hand'
import type { WebGraph } from '../types/web'
import { calculateWebShootDirection } from './calculateWebShootDirection'
import { WebShootTargetTracker } from './createWebShootTarget'
import { getWebShootOrigin } from './getWebShootOrigin'
import { createStrand } from './strandUtils'

export function generateShootWeb(
  hand: ProcessedHand,
  targetTracker: WebShootTargetTracker,
): WebGraph | null {
  const origin = getWebShootOrigin(hand)

  if (!origin) {
    return null
  }

  const target = targetTracker.createTarget(
    origin,
    calculateWebShootDirection(hand),
    hand.handScale,
  )
  const mainStrand = createStrand(
    origin,
    target,
    'shoot',
    WEB_CONFIG.shoot.strandThickness,
    WEB_CONFIG.rendering.baseOpacity,
  )

  return {
    mode: 'shoot',
    anchors: [origin, target],
    strands: mainStrand ? [mainStrand] : [],
  }
}
