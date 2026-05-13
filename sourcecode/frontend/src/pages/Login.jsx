import React from 'react'
import { login } from '../api'

export default function Login({ onLogin, goRegister }) {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await login({ email, password })
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('role', data.role || 'student')
      onLogin(data.access_token)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2>Welcome back</h2>
      <p style={{ color: '#8bb8ff', marginBottom: '20px', fontSize: '0.9rem' }}>Sign in to your AssessIQ account</p>
      <form onSubmit={submit}>
        <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: '8px 0' }}>{error}</p>}
        <button className="primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: '12px', justifyContent: 'center' }}>
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
      <p style={{ marginTop: '16px', fontSize: '0.9rem', color: '#8bb8ff', textAlign: 'center' }}>
        Don't have an account?{' '}
        <a href="#register" style={{ color: '#2f7cff' }} onClick={(e) => { e.preventDefault(); goRegister() }}>Register</a>
      </p>
    </div>
  )
}
