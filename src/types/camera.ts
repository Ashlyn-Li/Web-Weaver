export type CameraStatus =
  | 'idle'
  | 'requesting'
  | 'active'
  | 'denied'
  | 'unavailable'
  | 'error'

export type CameraDevice = {
  deviceId: string
  label: string
}

export type UseCameraResult = {
  devices: CameraDevice[]
  selectedDeviceId: string
  stream: MediaStream | null
  status: CameraStatus
  error: string | null
  startCamera: () => Promise<void>
  stopCamera: () => void
  selectCamera: (deviceId: string) => Promise<void>
}
