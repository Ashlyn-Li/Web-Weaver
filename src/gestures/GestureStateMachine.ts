import { GESTURE_CONFIG } from '../config/gestures'
import type {
  HandGestureName,
  StableGestureState,
} from '../types/gesture'

export class GestureStateMachine {
  private state: StableGestureState = {
    current: 'unknown',
    candidate: 'unknown',
    candidateFrames: 0,
    confidence: 0,
    releaseFrames: 0,
  }

  update(gesture: HandGestureName, confidence: number): StableGestureState {
    if (gesture === this.state.current) {
      this.state = {
        ...this.state,
        candidate: gesture,
        candidateFrames: 0,
        confidence,
        releaseFrames: 0,
      }

      return this.state
    }

    if (gesture === 'unknown') {
      const releaseFrames = this.state.releaseFrames + 1

      if (releaseFrames >= GESTURE_CONFIG.gestureReleaseFrames) {
        this.state = {
          current: 'unknown',
          candidate: 'unknown',
          candidateFrames: 0,
          confidence: 0,
          releaseFrames: 0,
        }
      } else {
        this.state = {
          ...this.state,
          candidate: 'unknown',
          candidateFrames: 0,
          releaseFrames,
        }
      }

      return this.state
    }

    const candidateFrames =
      gesture === this.state.candidate ? this.state.candidateFrames + 1 : 1

    if (candidateFrames >= GESTURE_CONFIG.gestureActivationFrames) {
      this.state = {
        current: gesture,
        candidate: gesture,
        candidateFrames: 0,
        confidence,
        releaseFrames: 0,
      }
    } else {
      this.state = {
        ...this.state,
        candidate: gesture,
        candidateFrames,
        confidence,
        releaseFrames: 0,
      }
    }

    return this.state
  }

  reset() {
    this.state = {
      current: 'unknown',
      candidate: 'unknown',
      candidateFrames: 0,
      confidence: 0,
      releaseFrames: 0,
    }
  }
}
