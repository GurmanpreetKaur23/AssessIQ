import { useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api"

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("student")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    if (mode === "register") {
      try {
        await API.post("/auth/register", { name, email, password, role })
        setSuccess("Registration successful. Welcome email sent. Please sign in.")
        setMode("login")
      } catch (err) {
        setError(err?.response?.data?.detail || "Unable to register")
      } finally {
        setLoading(false)
      }
      return
    }
    try {
      const res = await API.post("/auth/login", { email, password })
      localStorage.setItem("assessiq_token", res.data.access_token)
      localStorage.setItem("assessiq_user", JSON.stringify(res.data.user))
      if (res.data.user.role === "teacher") {
        navigate("/admin")
      } else {
        navigate("/")
      }
    } catch (err) {
      setError(err?.response?.data?.detail || "Invalid login credentials")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page auth-page">
      <form className="card auth-card" onSubmit={submit}>
        <h1 className="auth-title">AssessIQ</h1>
        <p className="auth-sub">Adaptive Olympiad Assessment Platform</p>
        <div className="auth-tabs">
          <button className={`btn tab ${mode === "login" ? "active" : ""}`} type="button" onClick={() => setMode("login")}>Sign In</button>
          <button className={`btn tab ${mode === "register" ? "active" : ""}`} type="button" onClick={() => setMode("register")}>Create Account</button>
        </div>
        {mode === "register" && (
          <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        )}
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {mode === "register" && (
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        )}
        {error && <span className="error">{error}</span>}
        {success && <span className="success">{success}</span>}
        <button className="btn primary" disabled={loading} type="submit">
          {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
        </button>
      </form>
    </div>
  )
}
