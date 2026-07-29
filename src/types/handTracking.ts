export type HandTrackingStatus =
  | 'idle'
  | 'loading-model'
  | 'ready'
  | 'tracking'
  | 'error'

export interface HandTrackingSummary {
  handCount: number
  leftHandDetected: boolean
  rightHandDetected: boolean
}
