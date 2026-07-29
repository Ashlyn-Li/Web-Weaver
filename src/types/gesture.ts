import type { FingerStates } from '../gestures/analyseFingers'
import type { InteractionDiagnostics } from '../gestures/analyseBimanualInteraction'
import type { WebAnchorCandidate } from '../gestures/getWebAnchorCandidates'

export type HandGestureName =
  | 'open-palm'
  | 'closed-fist'
  | 'pinch'
  | 'point'
  | 'web-shoot'
  | 'unknown'

export type InteractionMode = 'idle' | 'web-shoot' | 'web-weave'

export type Handedness = 'Left' | 'Right' | 'Unknown'

export interface NormalisedPoint {
  x: number
  y: number
  z: number
}

export interface ProcessedHand {
  id: string
  handedness: Handedness
  landmarks: readonly NormalisedPoint[]
  fingerStates: FingerStates
  gesture: HandGestureName
  gestureConfidence: number
  palmCentre: NormalisedPoint
  palmFacingConfidence: number
  handScale: number
  anchors: readonly WebAnchorCandidate[]
}

export interface StableGestureState {
  current: HandGestureName
  candidate: HandGestureName
  candidateFrames: number
  confidence: number
  releaseFrames: number
}

export interface StableInteractionState {
  current: InteractionMode
  candidate: InteractionMode
  candidateFrames: number
  confidence: number
  releaseFrames: number
}

export interface GestureTrackingSnapshot {
  hands: readonly ProcessedHand[]
  interaction: StableInteractionState
  diagnostics: InteractionDiagnostics
}
