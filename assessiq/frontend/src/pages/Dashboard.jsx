import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Gauge, LineChart, Radar, Sparkles, UserRoundCheck, UsersRound } from "lucide-react"
import API from "../api.js"

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [users, setUsers] = useState([])
  const [tests, setTests] = useState([])

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const [analyticsRes, usersRes, testsRes] = await Promise.all([
      API.get("/analytics/me"),
      API.get("/auth/users"),
      API.get("/tests")
    ])
    setAnalytics(analyticsRes.data)
    setUsers(usersRes.data)
    setTests(testsRes.data)
  }

  const onlineUsers = useMemo(() => users.filter((user) => user.status === "online"), [users])
  const recentUsers = useMemo(() => [...users].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5), [users])

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Live learning intelligence</p>
          <h1>Adaptive olympiad readiness, measured beyond marks.</h1>
        </div>
        <Link className="primary link-button" to="/test">Start Test <ArrowRight size={18} /></Link>
      </header>
      <section className="metric-grid">
        <div className="metric"><Gauge /><span>Accuracy</span><strong>{analytics ? `${Math.round(analytics.accuracy * 100)}%` : "--"}</strong></div>
        <div className="metric"><Radar /><span>Behavior Signals</span><strong>{analytics?.total_questions ?? 0} logs</strong></div>
        <div className="metric"><UsersRound /><span>JSON Users</span><strong>{users.length}</strong></div>
        <div className="metric"><UserRoundCheck /><span>Online Now</span><strong>{onlineUsers.length}</strong></div>
      </section>
      <section className="dashboard-grid">
        <div className="panel">
          <h2>Realtime Users</h2>
          <div className="user-list">
            {recentUsers.map((user) => (
              <div className="user-row" key={user.email}>
                <span className={user.status === "online" ? "status-dot online" : "status-dot"}></span>
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
            <Link className="primary link-button" to="/test"><Sparkles size={18} />Begin Adaptive Test</Link>
            <Link className="ghost link-button" to="/analytics"><LineChart size={18} />View Analytics</Link>
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
