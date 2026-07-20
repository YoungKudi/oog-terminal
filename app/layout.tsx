import React from 'react'
import type { Metadata } from 'next'
import './globals.css'
import AuthProvider from '@/components/providers/AuthProvider'

export const metadata: Metadata = {
  title: 'OOG Terminal',
  description: 'OOG Terminal Management System',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="theme-color" content="#0a2b3e" />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Register Service Worker for push notifications
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/service-worker.js')
                    .then(reg => console.log('📡 Service Worker registered', reg))
                    .catch(err => console.log('❌ Service Worker registration failed', err))
                })
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
