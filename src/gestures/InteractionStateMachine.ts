import { GESTURE_CONFIG } from '../config/gestures'
import type {
  InteractionMode,
  StableInteractionState,
} from '../types/gesture'

export class InteractionStateMachine {
  private state: StableInteractionState = {
    current: 'idle',
    candidate: 'idle',
    candidateFrames: 0,
    confidence: 0,
    releaseFrames: 0,
  }

  update(mode: InteractionMode, confidence: number): StableInteractionState {
    const activationFrames =
      mode === 'web-weave'
        ? GESTURE_CONFIG.weaveActivationFrames
        : GESTURE_CONFIG.gestureActivationFrames
    const releaseFrames =
      this.state.current === 'web-weave'
        ? GESTURE_CONFIG.weaveReleaseFrames
        : GESTURE_CONFIG.gestureReleaseFrames

    if (mode === this.state.current) {
      this.state = {
        ...this.state,
        candidate: mode,
        candidateFrames: 0,
        confidence,
        releaseFrames: 0,
      }

      return this.state
    }

    if (mode === 'idle') {
      const nextReleaseFrames = this.state.releaseFrames + 1

      if (nextReleaseFrames >= releaseFrames) {
        this.state = {
          current: 'idle',
          candidate: 'idle',
          candidateFrames: 0,
          confidence: 0,
          releaseFrames: 0,
        }
      } else {
        this.state = {
          ...this.state,
          candidate: 'idle',
          candidateFrames: 0,
          releaseFrames: nextReleaseFrames,
        }
      }

      return this.state
    }

    const candidateFrames =
      mode === this.state.candidate ? this.state.candidateFrames + 1 : 1

    if (candidateFrames >= activationFrames) {
      this.state = {
        current: mode,
        candidate: mode,
        candidateFrames: 0,
        confidence,
        releaseFrames: 0,
      }
    } else {
      this.state = {
        ...this.state,
        candidate: mode,
        candidateFrames,
        confidence,
        releaseFrames: 0,
      }
    }

    return this.state
  }
}
