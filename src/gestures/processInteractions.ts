import type { ProcessedHand } from '../types/hand'
import type { InteractionSnapshot } from '../types/interaction'
import {
  analyseBimanualInteraction,
  createEmptyInteractionDiagnostics,
} from './analyseBimanualInteraction'
import { classifyHandGesture } from './classifyHandGesture'
import { classifyInteraction } from './classifyInteraction'
import { HandGestureStateMachine } from './HandGestureStateMachine'
import { getWebAnchorCandidates } from './getWebAnchorCandidates'
import { InteractionStateMachine } from './InteractionStateMachine'

const emptyInteraction: InteractionSnapshot['stableInteraction'] = {
  current: 'idle',
  candidate: 'idle',
  candidateFrames: 0,
  confidence: 0,
  releaseFrames: 0,
}

export function createEmptyInteractionSnapshot(): InteractionSnapshot {
  return {
    stableHandGestures: [],
    stableInteraction: emptyInteraction,
    webAnchorCandidates: [],
    diagnostics: createEmptyInteractionDiagnostics(),
  }
}

export class InteractionProcessor {
  private handStateMachines = new Map<string, HandGestureStateMachine>()
  private interactionStateMachine = new InteractionStateMachine()

  process(hands: readonly ProcessedHand[]): InteractionSnapshot {
    const activeHandIds = new Set(hands.map((hand) => hand.id))
    const stableHandGestures = hands.map((hand) => {
      const stateMachine =
        this.handStateMachines.get(hand.id) ?? new HandGestureStateMachine()
      this.handStateMachines.set(hand.id, stateMachine)

      return stateMachine.update(hand.id, classifyHandGesture(hand))
    })
    const webAnchorCandidates = hands.flatMap((hand) =>
      getWebAnchorCandidates(hand),
    )

    this.handStateMachines.forEach((stateMachine, handId) => {
      if (!activeHandIds.has(handId)) {
        stateMachine.update(handId, { gesture: 'unknown', confidence: 0 })
      }
    })

    const bimanualClassification = analyseBimanualInteraction({
      anchors: webAnchorCandidates,
      hands,
      stableHandGestures,
    })
    const stableInteraction = this.interactionStateMachine.update(
      classifyInteraction({
        bimanualClassification,
        stableHandGestures,
      }),
    )

    return {
      stableHandGestures,
      stableInteraction,
      webAnchorCandidates,
      diagnostics: bimanualClassification.diagnostics,
    }
  }

  reset() {
    this.handStateMachines.clear()
    this.interactionStateMachine.reset()
  }
}
