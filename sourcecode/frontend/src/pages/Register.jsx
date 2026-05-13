import React from 'react'
import { register } from '../api'

export default function Register({ onRegistered, goLogin }) {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [name, setName] = React.useState('')
  const [adminSecret, setAdminSecret] = React.useState('')
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await register({
        email,
        password,
        full_name: name,
        ...(adminSecret ? { role: 'admin', adminSecret } : {}),
      })
      onRegistered()
    } catch (err) {
      setError(err?.response?.data?.detail || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2>Create account</h2>
      <p style={{ color: '#8bb8ff', marginBottom: '20px', fontSize: '0.9rem' }}>Join AssessIQ to start your adaptive learning journey</p>
      <form onSubmit={submit}>
        <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input placeholder="Password (min 6 chars)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        <input placeholder="Admin secret (leave blank for student)" value={adminSecret} onChange={(e) => setAdminSecret(e.target.value)} />
        {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: '8px 0' }}>{error}</p>}
        <button className="primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: '12px', justifyContent: 'center' }}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p style={{ marginTop: '16px', fontSize: '0.9rem', color: '#8bb8ff', textAlign: 'center' }}>
        Already have an account?{' '}
        <a href="#login" style={{ color: '#2f7cff' }} onClick={(e) => { e.preventDefault(); goLogin() }}>Login</a>
      </p>
    </div>
  )
}
