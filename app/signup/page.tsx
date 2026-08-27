"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  // ... (your existing signup code)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5', padding: '20px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '420px' }}>
        {/* ... your existing signup form */}
        
        <div style={{ marginTop: "8px", textAlign: "center", fontSize: "0.8rem" }}>
          <Link href="/public-search" style={{ color: "#1a73e8", textDecoration: "underline" }}>🔍 Search OOG Stack</Link>
        </div>
        
        {/* ... footer */}
      </div>
    </div>
  )
}
