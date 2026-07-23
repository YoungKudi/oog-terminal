"use client"
import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', userId: '', phone: '', role: 'user' })

  useEffect(() => {
    if (session?.user?.role !== 'officer') { router.push('/dashboard'); return }
    fetchUsers()
  }, [session, router])

  const fetchUsers = async () => {
    const res = await fetch('/api/users')
    if (res.ok) { const data = await res.json(); setUsers(data); setLoading(false) }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newUser) })
    if (res.ok) { setShowAddForm(false); setNewUser({ name: '', email: '', userId: '', phone: '', role: 'user' }); fetchUsers() } 
    else { const data = await res.json(); alert(data.error || 'Failed') }
  }

  const handleResetPassword = async (userId: string) => {
    if (!confirm('Reset password to default (password123)?')) return
    const res = await fetch(`/api/users/${userId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resetPassword: true }) })
    if (res.ok) { fetchUsers(); alert('Password reset to: password123') }
  }

  if (session?.user?.role !== 'officer') return <div style={{padding:'20px'}}>Access denied</div>

  return (
    <div style={{padding:'20px',maxWidth:'800px',margin:'0 auto'}}>
      <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px'}}>
        <button onClick={() => router.push('/dashboard')} style={{background:'none',border:'none',cursor:'pointer',fontSize:'1.2rem'}}>←</button>
        <h2 style={{fontSize:'1.2rem'}}>👑 Admin Panel</h2>
        <button className="btn btn-primary btn-sm" style={{marginLeft:'auto'}} onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? '✕ Cancel' : '+ Add User'}
        </button>
      </div>
      {showAddForm && <div className="card" style={{marginBottom:'16px'}}>
        <div className="card-header">Add New User</div>
        <div className="card-body">
          <form onSubmit={handleAddUser}>
            <div className="form-group"><label>Full Name</label><input type="text" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} required /></div>
            <div className="form-group"><label>Email</label><input type="email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} required /></div>
            <div className="form-group"><label>Worker ID</label><input type="text" value={newUser.userId} onChange={(e) => setNewUser({...newUser, userId: e.target.value.toUpperCase().trim()})} required placeholder="e.g., TC250709" /></div>
            <div className="form-group"><label>Phone</label><input type="tel" value={newUser.phone} onChange={(e) => setNewUser({...newUser, phone: e.target.value})} required placeholder="0209679230" /></div>
            <div className="form-group"><label>Role</label><select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})}><option value="user">User</option><option value="officer">Officer</option></select></div>
            <button type="submit" className="btn btn-primary">✅ Create User</button>
          </form>
        </div>
      </div>}
      <div className="card">
        <div className="card-header">All Users ({users.length})</div>
        <div className="card-body">
          {loading ? <p>Loading...</p> : users.map((u: any) => (
            <div key={u.id} className="container-item-list" style={{cursor:'default'}}>
              <div className="flex-between">
                <div><strong>{u.name}</strong> <span style={{color:'#64748b',fontSize:'0.75rem'}}>ID: {u.userId}</span></div>
                <div style={{display:'flex',gap:'4px',flexWrap:'wrap'}}>
                  <span className="badge">{u.role}</span>
                  <button className="btn-outline btn-sm" onClick={() => handleResetPassword(u.id)}>🔄 Reset Password</button>
                </div>
              </div>
              <div style={{fontSize:'0.65rem',color:'#64748b'}}>{u.email} | {u.phone}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{textAlign:'center',fontSize:'0.65rem',color:'#94a3b8',padding:'12px 0',borderTop:'1px solid #e2e8f0',marginTop:'16px'}}>
        Developed by <strong>O'Bour Dev</strong> © 2026
      </div>
    </div>
  )
}
