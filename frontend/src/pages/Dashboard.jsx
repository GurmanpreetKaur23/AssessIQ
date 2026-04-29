import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api"

export default function Dashboard() {
  const navigate = useNavigate()
  const [analytics, setAnalytics] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [prediction, setPrediction] = useState(null)
  const [globalStats, setGlobalStats] = useState({
    total_students: 50000,
    avg_accuracy: 0.98,
    questions_solved: 2000000,
    olympiads: 150
  })
  const user = JSON.parse(localStorage.getItem("assessiq_user") || "null")
  const isLoggedIn = Boolean(localStorage.getItem("assessiq_token") && user)

  const logout = () => {
    localStorage.removeItem("assessiq_token")
    localStorage.removeItem("assessiq_user")
    navigate("/login")
  }

  useEffect(() => {
    if (user?.role === "teacher") {
      navigate("/admin")
    }
  }, [navigate, user])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const adminStats = await API.get("/admin/student-stats")
        if (!cancelled) {
          setGlobalStats((prev) => ({
            ...prev,
            total_students: adminStats.data.total_students || prev.total_students,
            avg_accuracy: adminStats.data.avg_accuracy || prev.avg_accuracy
          }))
        }
      } catch {
      }
      if (!user || user.role !== "student") return
      try {
        const [aRes, rRes, pRes] = await Promise.all([
          API.get(`/analytics/student/${user.id}`),
          API.get(`/ml/recommend-topics/${user.id}`),
          API.post("/ml/predict-performance", { user_id: user.id })
        ])
        if (!cancelled) {
          setAnalytics(aRes.data)
          setRecommendations(rRes.data.topics)
          setPrediction(pRes.data)
          setGlobalStats((prev) => ({
            ...prev,
            questions_solved: prev.questions_solved + Math.floor((aRes.data.avg_time || 1) * 3)
          }))
        }
      } catch {
      }
    }
    load()
    const interval = setInterval(load, 8000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [user])

  return (
    <div className="landing">
      <div className="page">
        <nav className="nav-glass">
          <div className="brand">AssessIQ</div>
          <div className="nav-links">
            <button className="btn ghost" onClick={() => navigate("/")}>Home</button>
            <button className="btn ghost" onClick={() => navigate("/")}>Dashboard</button>
            <button className="btn ghost" onClick={() => navigate("/test")}>Take Test</button>
            <button className="btn ghost" onClick={() => navigate("/analytics")}>Analytics</button>
            <button className="btn ghost" onClick={() => navigate("/admin")}>Admin</button>
          </div>
          <div className="nav-actions">
            {isLoggedIn ? (
              <button className="btn ghost" onClick={logout}>Logout</button>
            ) : (
              <button className="btn ghost" onClick={() => navigate("/login")}>Sign In</button>
            )}
            <button className="btn primary" onClick={() => navigate("/test")}>Get Started</button>
          </div>
        </nav>

        <section className="hero">
          <span className="chip">AI-Powered Adaptive Assessment</span>
          <h1 className="hero-title">Predict. Adapt. <span>Excel.</span></h1>
          <p className="hero-sub">
            AssessIQ uses behavioral learning analytics and machine learning to predict performance,
            adapt difficulty in real-time, and deliver personalized Olympiad preparation.
          </p>
          <div className="hero-actions">
            <button className="btn primary big" onClick={() => navigate("/test")}>Start Free Test</button>
            <button className="btn big" onClick={() => navigate("/analytics")}>View Dashboard</button>
          </div>
          <div className="stats-row">
            <div><h2>{Math.round(globalStats.total_students / 1000)}K+</h2><p>Students</p></div>
            <div><h2>{Math.round((analytics?.accuracy ?? globalStats.avg_accuracy) * 100)}%</h2><p>Accuracy</p></div>
            <div><h2>{Math.round(globalStats.questions_solved / 1000000)}M+</h2><p>Questions Solved</p></div>
            <div><h2>{globalStats.olympiads}+</h2><p>Olympiads</p></div>
          </div>
        </section>

        <section className="feature-section">
          <h2>Intelligent Features for <span>Smarter Learning</span></h2>
          <p>Built with cutting-edge ML models and behavioral analytics to give every student a personalized path.</p>
          <div className="grid feature-grid">
            <div className="card"><h3>Adaptive Testing</h3><p>Fast + correct goes harder, slow + wrong goes easier.</p></div>
            <div className="card"><h3>Behavioral Analytics</h3><p>Tracks time per question, revisit patterns, and answer changes.</p></div>
            <div className="card"><h3>ML Predictions</h3><p>Forecasts score and Olympiad pass probability using live attempts.</p></div>
            <div className="card"><h3>Performance Dashboard</h3><p>Accuracy, speed, and topic-wise strengths with trend monitoring.</p></div>
            <div className="card"><h3>Smart Recommendations</h3><p>{recommendations.length ? recommendations.join(", ") : "Personalized practice based on your weak topics."}</p></div>
            <div className="card"><h3>Anomaly Detection</h3><p>{analytics?.guessing_rate ? `Guessing index ${Math.round(analytics.guessing_rate * 100)}%` : "Detects abnormal response spikes and random attempts."}</p></div>
          </div>
        </section>

        <section className="how-section">
          <h2>How <span>AssessIQ</span> Works</h2>
          <div className="steps">
            <div className="step"><h4>Step 01</h4><h3>Take a Test</h3><p>Start an adaptive test that tunes difficulty in real-time.</p></div>
            <div className="step"><h4>Step 02</h4><h3>Get Insights</h3><p>See behavioral analytics and ML predictions after each attempt.</p></div>
            <div className="step"><h4>Step 03</h4><h3>Improve</h3><p>Follow tailored recommendations to improve weak topics quickly.</p></div>
          </div>
        </section>

        <section className="cta card">
          <h2>Ready to Ace Your Olympiad?</h2>
          <p>
            {prediction
              ? `Current predicted score ${prediction.predicted_score.toFixed(1)} with pass probability ${Math.round(prediction.pass_probability * 100)}%.`
              : "Take one adaptive session now and unlock real-time predictions."}
          </p>
          <button className="btn primary big" onClick={() => navigate("/test")}>Start Now</button>
        </section>
      </div>
    </div>
  )
}
