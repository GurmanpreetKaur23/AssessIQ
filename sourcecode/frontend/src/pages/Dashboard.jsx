import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Gauge, LineChart, Radar, Sparkles, UserRoundCheck, UsersRound } from 'lucide-react'
import API from '../api.js'

export default function Dashboard({ onNavigate, onLogout }) {
  const [analytics, setAnalytics] = useState(null)
  const [users, setUsers] = useState([])
  const [tests, setTests] = useState([])

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      const [analyticsRes, usersRes, testsRes] = await Promise.all([
        API.get('/analytics/me'),
        API.get('/auth/users'),
        API.get('/tests'),
      ])
      setAnalytics(analyticsRes.data)
      setUsers(usersRes.data)
      setTests(testsRes.data)
    } catch (err) {
      // 401 is handled globally by the axios interceptor (auto-logout)
      console.error('Dashboard load error:', err?.response?.data?.detail || err.message)
    }
  }

  const onlineUsers = useMemo(() => users.filter((u) => u.status === 'online'), [users])
  const recentUsers = useMemo(
    () => [...users].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5),
    [users]
  )
  const isAdmin = localStorage.getItem('role') === 'admin'

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Live learning intelligence</p>
          <h1>Adaptive olympiad readiness, measured beyond marks.</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="primary link-button" onClick={() => onNavigate('test')}>
            Start Test <ArrowRight size={18} />
          </button>
          {isAdmin && (
            <button className="ghost link-button" onClick={() => onNavigate('admin')}>
              Admin Panel
            </button>
          )}
          <button className="ghost link-button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>
      <section className="metric-grid">
        <div className="metric"><Gauge /><span>Accuracy</span><strong>{analytics ? `${Math.round(analytics.accuracy * 100)}%` : '--'}</strong></div>
        <div className="metric"><Radar /><span>Behavior Signals</span><strong>{analytics?.total_questions ?? 0} logs</strong></div>
        <div className="metric"><UsersRound /><span>Users</span><strong>{users.length}</strong></div>
        <div className="metric"><UserRoundCheck /><span>Online Now</span><strong>{onlineUsers.length}</strong></div>
      </section>
      <section className="dashboard-grid">
        <div className="panel">
          <h2>Realtime Users</h2>
          <div className="user-list">
            {recentUsers.map((user) => (
              <div className="user-row" key={user.email}>
                <span className={user.status === 'online' ? 'status-dot online' : 'status-dot'} />
                <div>
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                </div>
                <em>{user.role}</em>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <h2>Active Assessment</h2>
          {tests.map((test) => (
            <div className="test-card" key={test.id}>
              <strong>{test.title}</strong>
              <span>{test.mode} • {test.time_limit_minutes} min • {test.question_limit} questions</span>
            </div>
          ))}
          <div className="quick-actions">
            <button className="primary link-button" onClick={() => onNavigate('test')}>
              <Sparkles size={18} /> Begin Adaptive Test
            </button>
            <button className="ghost link-button" onClick={() => onNavigate('analytics')}>
              <LineChart size={18} /> View Analytics
            </button>
          </div>
        </div>
      </section>
      <section className="workflow">
        <div><strong>1</strong><span>Student starts an adaptive diagnostic</span></div>
        <div><strong>2</strong><span>Every answer logs accuracy, speed, revisits, tab switches, and inactivity</span></div>
        <div><strong>3</strong><span>Difficulty changes in real time based on behavioral and correctness signals</span></div>
        <div><strong>4</strong><span>Analytics produce predictions, clusters, anomalies, and recommendations</span></div>
      </section>
    </div>
  )
}
