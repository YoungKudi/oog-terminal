'use client'

import React, { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an external service or console
    console.error('Global error caught:', error)
    
    // You can also send this to an API endpoint
    fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error.message,
        stack: error.stack,
        digest: error.digest,
        url: window.location.href
      })
    }).catch(() => {})
  }, [error])

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: 'red' }}>Something went wrong</h1>
      <p><strong>Error:</strong> {error.message}</p>
      <details style={{ marginTop: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}>
        <summary>Stack trace</summary>
        <pre style={{ fontSize: '12px', overflow: 'auto', maxHeight: '300px' }}>
          {error.stack || 'No stack trace available'}
        </pre>
      </details>
      <button
        onClick={reset}
        style={{
          marginTop: '16px',
          padding: '10px 20px',
          background: '#1e6f3f',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        Try again
      </button>
    </div>
  )
}
