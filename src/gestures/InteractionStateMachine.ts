import { GESTURE_CONFIG } from '../config/gestures'
import type {
  InteractionClassification,
  StableInteractionState,
} from '../types/interaction'

export class InteractionStateMachine {
  private state: StableInteractionState = {
    current: 'idle',
    candidate: 'idle',
    candidateFrames: 0,
    confidence: 0,
    releaseFrames: 0,
  }

  update(classification: InteractionClassification): StableInteractionState {
    if (classification.mode === this.state.current) {
      this.state = {
        ...this.state,
        candidate: classification.mode,
        candidateFrames: 0,
        confidence: classification.confidence,
        activeHandId: classification.activeHandId,
        releaseFrames: 0,
      }

      return this.state
    }

    if (classification.mode === 'idle') {
      const releaseFrames = this.state.releaseFrames + 1

      if (releaseFrames >= GESTURE_CONFIG.interactionReleaseFrames) {
        this.state = {
          current: 'idle',
          candidate: 'idle',
          candidateFrames: 0,
          confidence: 0,
          activeHandId: undefined,
          releaseFrames: 0,
        }
      } else {
        this.state = {
          ...this.state,
          candidate: 'idle',
          releaseFrames,
        }
      }

      return this.state
    }

    const candidateFrames =
      classification.mode === this.state.candidate
        ? this.state.candidateFrames + 1
        : 1

    if (candidateFrames >= GESTURE_CONFIG.interactionActivationFrames) {
      this.state = {
        current: classification.mode,
        candidate: classification.mode,
        candidateFrames: 0,
        confidence: classification.confidence,
        activeHandId: classification.activeHandId,
        releaseFrames: 0,
      }
    } else {
      this.state = {
        ...this.state,
        candidate: classification.mode,
        candidateFrames,
        confidence: classification.confidence,
        activeHandId: classification.activeHandId,
        releaseFrames: 0,
      }
    }

    return this.state
  }

  reset() {
    this.state = {
      current: 'idle',
      candidate: 'idle',
      candidateFrames: 0,
      confidence: 0,
      releaseFrames: 0,
    }
  }
}
