import type { CameraDevice } from '../types/camera'

type CameraSelectorProps = {
  devices: CameraDevice[]
  selectedDeviceId: string
  onSelectCamera: (deviceId: string) => void
}

export function CameraSelector({
  devices,
  selectedDeviceId,
  onSelectCamera,
}: CameraSelectorProps) {
  return (
    <label className="camera-selector">
      <span>Camera</span>
      <select
        value={selectedDeviceId}
        onChange={(event) => {
          onSelectCamera(event.target.value)
        }}
        disabled={devices.length === 0}
      >
        {devices.length === 0 ? (
          <option value="">No cameras found</option>
        ) : (
          devices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))
        )}
      </select>
    </label>
  )
}
