import type {
  InteractionClassification,
  StableHandGesture,
} from '../types/interaction'

type ClassifyInteractionOptions = {
  bimanualClassification: InteractionClassification
  stableHandGestures: readonly StableHandGesture[]
}

export function classifyInteraction({
  bimanualClassification,
  stableHandGestures,
}: ClassifyInteractionOptions): InteractionClassification {
  if (bimanualClassification.mode === 'web-weave') {
    return bimanualClassification
  }

  const webShootGesture = stableHandGestures
    .filter((gesture) => gesture.gesture === 'web-shoot')
    .sort((a, b) => b.confidence - a.confidence)[0]

  if (webShootGesture) {
    return {
      mode: 'web-shoot',
      confidence: webShootGesture.confidence,
      activeHandId: webShootGesture.handId,
    }
  }

  return {
    mode: 'idle',
    confidence: 0,
  }
}
