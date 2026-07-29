export interface Point3D {
  x: number
  y: number
  z: number
}

export interface FingerState {
  extended: boolean
}

export interface FingerStates {
  thumb: FingerState
  index: FingerState
  middle: FingerState
  ring: FingerState
  little: FingerState
}

export type Handedness = 'Left' | 'Right' | 'Unknown'

export interface ProcessedHand {
  id: string
  handedness: Handedness
  landmarks: readonly Point3D[]
  palmCenter: Point3D
  palmNormal: Point3D
  handScale: number
  fingerStates: FingerStates
}
