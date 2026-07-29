import { WEB_CONFIG } from '../config/web'
import type { WebStrand } from '../types/web'

type TrackedStrand = {
  missingFrames: number
  strand: WebStrand
}

export class WebTopologyTracker {
  private strands = new Map<string, TrackedStrand>()

  preserve(nextStrands: readonly WebStrand[]) {
    const nextIds = new Set(nextStrands.map((strand) => strand.id))

    nextStrands.forEach((strand) => {
      this.strands.set(strand.id, {
        missingFrames: 0,
        strand,
      })
    })

    this.strands.forEach((trackedStrand, strandId) => {
      if (nextIds.has(strandId)) {
        return
      }

      const missingFrames = trackedStrand.missingFrames + 1

      if (missingFrames >= WEB_CONFIG.weave.anchorLossToleranceFrames) {
        this.strands.delete(strandId)
      } else {
        this.strands.set(strandId, {
          ...trackedStrand,
          missingFrames,
        })
      }
    })

    return Array.from(this.strands.values()).map(({ strand }) => strand)
  }

  reset() {
    this.strands.clear()
  }
}
