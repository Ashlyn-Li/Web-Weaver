type CameraPermissionButtonProps = {
  label: string
  disabled?: boolean
}

export function CameraPermissionButton({
  label,
  disabled = false,
}: CameraPermissionButtonProps) {
  return (
    <button type="button" className="camera-button" disabled={disabled}>
      {label}
    </button>
  )
}
