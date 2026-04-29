import { useEffect, useMemo, useState } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { useNavigate } from "react-router-dom"
import API from "../api"

export default function Analytics() {
  const navigate = useNavigate()
  const user = useMemo(() => JSON.parse(localStorage.getItem("assessiq_user") || "null"), [])
  const [data, setData] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [cluster, setCluster] = useState(null)
  const [anomalies, setAnomalies] = useState([])

  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }
    API.get(`/analytics/student/${user.id}`).then((res) => setData(res.data))
    API.get(`/analytics/timeline/${user.id}`).then((res) => setTimeline(res.data))
    API.post("/ml/cluster-students").then((res) => {
      const found = res.data.find((x) => x.user_id === user.id)
      setCluster(found ? found.cluster : null)
    })
    API.get(`/ml/anomaly/${user.id}`).then((res) => setAnomalies(res.data.flags))
  }, [navigate, user])

  return (
    <div className="page">
      <header className="topbar">
        <h1>Behavioral Analytics</h1>
        <button className="btn" onClick={() => navigate("/")}>Back</button>
      </header>
      <section className="grid">
        <div className="card">
          <h3>Metrics</h3>
          <p>Accuracy: {data ? `${Math.round(data.accuracy * 100)}%` : "-"}</p>
          <p>Average Time: {data ? `${data.avg_time.toFixed(1)}s` : "-"}</p>
          <p>Guessing Index: {data ? `${Math.round(data.guessing_rate * 100)}%` : "-"}</p>
          <p>Answer Change Rate: {data ? `${Math.round(data.change_rate * 100)}%` : "-"}</p>
          <p>Cluster: {cluster ?? "-"}</p>
        </div>
        <div className="card chart-card">
          <h3>Progress Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="attempt" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3>Behavior Alerts</h3>
          {anomalies.length === 0 ? <p>No anomalies detected.</p> : anomalies.map((a) => <p key={a}>{a}</p>)}
        </div>
      </section>
    </div>
  )
}
