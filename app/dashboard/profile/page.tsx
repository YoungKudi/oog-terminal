"use client"
import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [name, setName] = useState(session?.user?.name || '')
  const [phone, setPhone] = useState(session?.user?.phone || '')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  if (!session) return null

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setMessage(''); setLoading(true)
    const updates: any = {}
    if (name !== session.user.name) updates.name = name
    if (phone !== session.user.phone) updates.phone = phone
    if (Object.keys(updates).length === 0) { setError('No changes'); setLoading(false); return }
    const res = await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) })
    if (res.ok) { setMessage('✅ Profile updated!') } else { const data = await res.json(); setError(data.error || 'Update failed') }
    setLoading(false)
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return }
    const res = await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword, newPassword }) })
    if (res.ok) { setMessage('✅ Password changed! Please login again.'); setTimeout(() => router.push('/api/auth/signout?callbackUrl=/login'), 1500) } 
    else { const data = await res.json(); setError(data.error || 'Password change failed') }
  }

  return (
    <div style={{padding:'20px',maxWidth:'500px',margin:'0 auto'}}>
      <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px'}}>
        <button onClick={() => router.push('/dashboard')} style={{background:'none',border:'none',cursor:'pointer',fontSize:'1.2rem'}}>←</button>
        <h2 style={{fontSize:'1.2rem'}}>👤 My Profile</h2>
      </div>
      <div className="card">
        <div className="card-header">Profile Information</div>
        <div className="card-body">
          <div style={{marginBottom:'12px'}}>
            <label style={{fontSize:'0.7rem',color:'#64748b'}}>Worker ID</label>
            <div style={{padding:'8px 12px',background:'#f1f5f9',borderRadius:'8px',fontSize:'0.9rem',fontWeight:'600'}}>
              {session.user?.userId}
            </div>
          </div>
          <form onSubmit={handleUpdate}>
            <div className="form-group"><label>Full Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div className="form-group"><label>Email</label><input type="email" value={session.user?.email || ''} disabled style={{background:'#f1f5f9'}} /></div>
            <div className="form-group"><label>Phone Number</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required /></div>
            {error && <p style={{color:'#dc2626',fontSize:'0.85rem',margin:'8px 0'}}>{error}</p>}
            {message && <p style={{color:'#10b981',fontSize:'0.85rem',margin:'8px 0'}}>{message}</p>}
            <button type="submit" disabled={loading} className="btn btn-primary" style={{width:'100%'}}>
              {loading ? 'Saving...' : '💾 Save Changes'}
            </button>
          </form>
          <div style={{marginTop:'12px',paddingTop:'12px',borderTop:'1px solid #e2e8f0'}}>
            <button className="btn btn-outline" style={{width:'100%'}} onClick={() => setShowPasswordModal(true)}>
              🔑 Change Password
            </button>
          </div>
        </div>
      </div>
      {showPasswordModal && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'20px'}}>
          <div style={{background:'white',borderRadius:'24px',padding:'24px',maxWidth:'440px',width:'100%'}}>
            <h3 style={{marginBottom:'16px'}}>🔑 Change Password</h3>
            <form onSubmit={handlePasswordChange}>
              <div className="form-group"><label>Current Password</label><input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required /></div>
              <div className="form-group"><label>New Password</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required /></div>
              <div className="form-group"><label>Confirm New Password</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div>
              {error && <p style={{color:'#dc2626',fontSize:'0.85rem',margin:'8px 0'}}>{error}</p>}
              {message && <p style={{color:'#10b981',fontSize:'0.85rem',margin:'8px 0'}}>{message}</p>}
              <div style={{display:'flex',gap:'8px',marginTop:'12px'}}>
                <button type="submit" className="btn btn-primary" style={{flex:1}}>✅ Change Password</button>
                <button type="button" className="btn btn-outline" onClick={() => { setShowPasswordModal(false); setError(''); setMessage('') }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div style={{textAlign:'center',fontSize:'0.65rem',color:'#94a3b8',padding:'12px 0',borderTop:'1px solid #e2e8f0',marginTop:'16px'}}>
        Developed by <strong>O'Bour Dev</strong> © 2026
      </div>
    </div>
  )
}
