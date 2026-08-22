"use client"
import React, { useState, useEffect } from 'react'

export default function DashboardPage() {
  const [data, setData] = useState({ containers: 0, queue: 0, devanning: 0 })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [containersRes, queueRes] = await Promise.all([
          fetch('/api/containers'),
          fetch('/api/import-queue')
        ])
        
        const containers = await containersRes.json()
        const queue = await queueRes.json()
        
        setData({
          containers: containers?.length || 0,
          queue: queue?.length || 0,
          devanning: 0
        })
      } catch (err) {
        setError('Failed to load dashboard data')
        console.error('Dashboard error:', err)
      }
    }
    
    fetchData()
  }, [])

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p className="text-red-500">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-600 dark:text-gray-300">Welcome to OOG Terminal</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="font-semibold">Containers</h3>
          <p className="text-2xl font-bold">{data.containers}</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="font-semibold">Queue</h3>
          <p className="text-2xl font-bold">{data.queue}</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="font-semibold">Devanning</h3>
          <p className="text-2xl font-bold">{data.devanning}</p>
        </div>
      </div>
    </div>
  )
}
