import type { Point3D } from './hand'

export type HandGestureName =
  | 'open-palm'
  | 'closed-fist'
  | 'pinch'
  | 'point'
  | 'web-shoot'
  | 'unknown'

export type InteractionMode = 'idle' | 'web-shoot' | 'web-weave'

export interface HandGestureClassification {
  gesture: HandGestureName
  confidence: number
}

export interface StableHandGesture extends HandGestureClassification {
  handId: string
}

export interface InteractionClassification {
  mode: InteractionMode
  confidence: number
  activeHandId?: string
}

export interface StableInteractionState {
  current: InteractionMode
  candidate: InteractionMode
  candidateFrames: number
  confidence: number
  activeHandId?: string
  releaseFrames: number
}

export type WebAnchorName =
  | 'thumb-tip'
  | 'index-tip'
  | 'middle-tip'
  | 'ring-tip'
  | 'little-tip'
  | 'palm-centre'

export interface WebAnchorCandidate {
  handId: string
  name: WebAnchorName
  landmarkIndex: number | null
  position: Point3D
  confidence: number
}

export interface InteractionDiagnostics {
  palmDistanceRatio: number
  totalAnchorCount: number
}

export interface InteractionSnapshot {
  stableHandGestures: readonly StableHandGesture[]
  stableInteraction: StableInteractionState
  webAnchorCandidates: readonly WebAnchorCandidate[]
  diagnostics: InteractionDiagnostics
}
