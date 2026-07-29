import type { ProcessedHand } from '../types/hand'
import type { StableInteractionState, WebAnchorCandidate } from '../types/interaction'
import type { WebGraph } from '../types/web'
import { createWebAnchors } from './createWebAnchors'
import { generateShootWeb } from './generateShootWeb'
import { generateWeaveWeb } from './generateWeaveWeb'
import { ShootWebState } from './ShootWebState'
import { WebTopologyTracker } from './WebTopologyTracker'

export interface GenerateWebInput {
  interaction: StableInteractionState
  processedHands: readonly ProcessedHand[]
  anchorCandidates: readonly WebAnchorCandidate[]
}

export class WebGenerator {
  private shootState = new ShootWebState()
  private topologyTracker = new WebTopologyTracker()

  generate({
    anchorCandidates,
    interaction,
    processedHands,
  }: GenerateWebInput): WebGraph | null {
    if (interaction.current === 'idle') {
      this.shootState.reset()
      this.topologyTracker.reset()
      return null
    }

    if (interaction.current === 'web-shoot') {
      this.topologyTracker.reset()
      const activeHand = processedHands.find(
        (hand) => hand.id === interaction.activeHandId,
      )

      return activeHand
        ? generateShootWeb(activeHand, this.shootState)
        : null
    }

    this.shootState.reset()
    return generateWeaveWeb(
      createWebAnchors(anchorCandidates),
      this.topologyTracker,
    )
  }

  reset() {
    this.shootState.reset()
    this.topologyTracker.reset()
  }
}
