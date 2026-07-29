import { ExperienceShell } from './components/ExperienceShell'
import type { ApplicationPhase } from './types/application'

function App() {
  const phase: ApplicationPhase = 'ready'
  const statusText = 'Phase 2: Architecture established'

  return (
    <ExperienceShell phase={phase} statusText={statusText} />
  )
}

export default App
