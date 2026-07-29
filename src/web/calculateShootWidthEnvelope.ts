import { WEB_CONFIG } from '../config/web'

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)))

  return t * t * (3 - 2 * t)
}

function mix(start: number, end: number, amount: number) {
  return start + (end - start) * amount
}

export function calculateShootWidthEnvelope(progress: number, length: number) {
  const launchWidth = WEB_CONFIG.shoot.launchWidthRatio * length
  const bodyWidth = WEB_CONFIG.shoot.bodyWidthRatio * length
  const headWidth = WEB_CONFIG.shoot.headWidthRatio * length
  const bodyAmount = smoothstep(0, 0.7, progress)
  const headAmount = smoothstep(1 - WEB_CONFIG.shoot.headLengthRatio, 1, progress)

  return mix(mix(launchWidth, bodyWidth, bodyAmount), headWidth, headAmount)
}
