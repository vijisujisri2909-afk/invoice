import { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Invoice app crashed while rendering.', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main role="alert" style={{ maxWidth: 640, margin: '10vh auto', padding: 24 }}>
          <h1>Invoice app could not load</h1>
          <p>Reload the page to try again.</p>
          <button type="button" onClick={() => window.location.reload()}>
            Reload app
          </button>
        </main>
      )
    }

    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
