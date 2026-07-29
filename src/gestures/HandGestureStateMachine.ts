import { GESTURE_CONFIG } from '../config/gestures'
import type {
  HandGestureClassification,
  HandGestureName,
  StableHandGesture,
} from '../types/interaction'

export class HandGestureStateMachine {
  private current: HandGestureName = 'unknown'
  private candidate: HandGestureName = 'unknown'
  private candidateFrames = 0
  private confidence = 0
  private releaseFrames = 0

  update(
    handId: string,
    classification: HandGestureClassification,
  ): StableHandGesture {
    if (classification.gesture === this.current) {
      this.candidate = classification.gesture
      this.candidateFrames = 0
      this.confidence = classification.confidence
      this.releaseFrames = 0

      return this.getStableGesture(handId)
    }

    if (classification.gesture === 'unknown') {
      this.releaseFrames += 1

      if (this.releaseFrames >= GESTURE_CONFIG.gestureReleaseFrames) {
        this.current = 'unknown'
        this.candidate = 'unknown'
        this.candidateFrames = 0
        this.confidence = 0
        this.releaseFrames = 0
      }

      return this.getStableGesture(handId)
    }

    this.candidateFrames =
      classification.gesture === this.candidate ? this.candidateFrames + 1 : 1
    this.candidate = classification.gesture
    this.confidence = classification.confidence
    this.releaseFrames = 0

    if (this.candidateFrames >= GESTURE_CONFIG.gestureActivationFrames) {
      this.current = classification.gesture
      this.candidateFrames = 0
    }

    return this.getStableGesture(handId)
  }

  reset() {
    this.current = 'unknown'
    this.candidate = 'unknown'
    this.candidateFrames = 0
    this.confidence = 0
    this.releaseFrames = 0
  }

  private getStableGesture(handId: string): StableHandGesture {
    return {
      handId,
      gesture: this.current,
      confidence: this.confidence,
    }
  }
}
