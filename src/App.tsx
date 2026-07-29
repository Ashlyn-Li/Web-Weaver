import './App.css'

function App() {
  return (
    <main className="app-shell">
      <section className="landing" aria-labelledby="page-title">
        <p className="status">Phase 1: Application initialised</p>
        <div className="landing-copy">
          <h1 id="page-title">Web Weaver</h1>
          <p>
            A real-time hand-tracking experience that transforms movement into
            dynamic spider-web geometry.
          </p>
        </div>
        <button type="button" className="camera-button" disabled>
          Enable Camera
        </button>
      </section>
    </main>
  )
}

export default App
