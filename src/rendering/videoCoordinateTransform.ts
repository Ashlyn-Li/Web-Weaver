export type VideoCoordinateTransform = {
  renderedWidth: number
  renderedHeight: number
  offsetX: number
  offsetY: number
  scale: number
}

type CreateVideoCoordinateTransformOptions = {
  displayWidth: number
  displayHeight: number
  videoWidth: number
  videoHeight: number
}

type MapNormalizedPointOptions = CreateVideoCoordinateTransformOptions & {
  mirrored: boolean
  x: number
  y: number
}

export function createVideoCoordinateTransform({
  displayWidth,
  displayHeight,
  videoWidth,
  videoHeight,
}: CreateVideoCoordinateTransformOptions): VideoCoordinateTransform {
  const scale = Math.max(displayWidth / videoWidth, displayHeight / videoHeight)
  const renderedWidth = videoWidth * scale
  const renderedHeight = videoHeight * scale

  return {
    renderedWidth,
    renderedHeight,
    offsetX: (renderedWidth - displayWidth) / 2,
    offsetY: (renderedHeight - displayHeight) / 2,
    scale,
  }
}

export function mapNormalizedVideoPoint({
  displayWidth,
  displayHeight,
  mirrored,
  videoWidth,
  videoHeight,
  x,
  y,
}: MapNormalizedPointOptions) {
  const transform = createVideoCoordinateTransform({
    displayWidth,
    displayHeight,
    videoWidth,
    videoHeight,
  })
  const sourceX = mirrored ? 1 - x : x

  return {
    x: sourceX * transform.renderedWidth - transform.offsetX,
    y: y * transform.renderedHeight - transform.offsetY,
  }
}
