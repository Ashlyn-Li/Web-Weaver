export type CameraStatus =
  | 'idle'
  | 'requesting'
  | 'active'
  | 'denied'
  | 'unavailable'
  | 'error'

export type UseCameraResult = {
  stream: MediaStream | null
  status: CameraStatus
  error: string | null
  startCamera: () => Promise<void>
  stopCamera: () => void
}
