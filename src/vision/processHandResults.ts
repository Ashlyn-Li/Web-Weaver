import type { Category, HandLandmarkerResult } from '@mediapipe/tasks-vision'
import { GestureStateMachine } from '../gestures/GestureStateMachine'
import { InteractionStateMachine } from '../gestures/InteractionStateMachine'
import { analyseBimanualInteraction } from '../gestures/analyseBimanualInteraction'
import { analyseFingers } from '../gestures/analyseFingers'
import { classifyGesture } from '../gestures/classifyGesture'
import { getWebAnchorCandidates } from '../gestures/getWebAnchorCandidates'
import {
  calculatePalmCentre,
  calculatePalmFacingConfidence,
  calculatePalmSize,
} from '../gestures/landmarkUtils'
import type {
  GestureTrackingSnapshot,
  Handedness,
  NormalisedPoint,
  ProcessedHand,
} from '../types/gesture'
import { LandmarkSmoother } from './landmarkSmoothing'

const emptyInteraction = {
  current: 'idle',
  candidate: 'idle',
  candidateFrames: 0,
  confidence: 0,
  releaseFrames: 0,
} as const

const emptySnapshot: GestureTrackingSnapshot = {
  hands: [],
  interaction: emptyInteraction,
  diagnostics: {
    activeHandId: null,
    palmDistanceRatio: 0,
    totalAnchorCount: 0,
  },
}

function getHandedness(classifications: readonly Category[] | undefined): Handedness {
  const categoryName = classifications?.[0]?.categoryName

  if (categoryName === 'Left' || categoryName === 'Right') {
    return categoryName
  }

  return 'Unknown'
}

function getHandId(handedness: Handedness, index: number) {
  return handedness === 'Unknown' ? `Unknown-${index}` : handedness
}

function toNormalisedPoints(
  landmarks: HandLandmarkerResult['landmarks'][number],
): NormalisedPoint[] {
  return landmarks.map((landmark) => ({
    x: landmark.x,
    y: landmark.y,
    z: landmark.z ?? 0,
  }))
}

export class HandResultProcessor {
  private gestureStateMachines = new Map<string, GestureStateMachine>()
  private interactionStateMachine = new InteractionStateMachine()
  private smoother = new LandmarkSmoother()

  process(result: HandLandmarkerResult): GestureTrackingSnapshot {
    const activeIds = new Set<string>()
    const handedness = result.handedness ?? result.handednesses ?? []
    const processedHands = result.landmarks.flatMap<ProcessedHand>(
      (rawLandmarks, index) => {
        if (rawLandmarks.length < 21) {
          return []
        }

        const hand = getHandedness(handedness[index])
        const id = getHandId(hand, index)
        activeIds.add(id)

        const landmarks = this.smoother.smooth(
          id,
          hand,
          toNormalisedPoints(rawLandmarks),
        )
        const handScale = calculatePalmSize(landmarks)
        const fingerStates = analyseFingers(landmarks, handScale)
        const classification = classifyGesture({
          fingerStates,
          handScale,
          landmarks,
        })
        const gestureStateMachine =
          this.gestureStateMachines.get(id) ?? new GestureStateMachine()
        this.gestureStateMachines.set(id, gestureStateMachine)
        const stableGesture = gestureStateMachine.update(
          classification.gesture,
          classification.confidence,
        )
        const palmCentre = calculatePalmCentre(landmarks)

        return [
          {
            id,
            handedness: hand,
            landmarks,
            fingerStates,
            gesture: stableGesture.current,
            gestureConfidence: stableGesture.confidence,
            palmCentre,
            palmFacingConfidence: calculatePalmFacingConfidence(landmarks),
            handScale,
            anchors: getWebAnchorCandidates({
              fingerStates,
              handId: id,
              landmarks,
            }),
          },
        ]
      },
    )

    this.smoother.expireMissingHands(activeIds)
    this.gestureStateMachines.forEach((stateMachine, handId) => {
      if (!activeIds.has(handId)) {
        stateMachine.update('unknown', 0)
      }
    })

    const interactionClassification = analyseBimanualInteraction(processedHands)
    const interaction = this.interactionStateMachine.update(
      interactionClassification.mode,
      interactionClassification.confidence,
    )

    return {
      hands: processedHands,
      interaction,
      diagnostics: interactionClassification.diagnostics,
    }
  }

  reset() {
    this.gestureStateMachines.clear()
    this.interactionStateMachine = new InteractionStateMachine()
    this.smoother.reset()
  }
}

export function createEmptyGestureTrackingSnapshot(): GestureTrackingSnapshot {
  return emptySnapshot
}
