import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Brain, Lock, Mail, UserRound } from "lucide-react"
import API from "../api.js"

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState("login")
  const [form, setForm] = useState({ name: "Demo Student", email: "student@assessiq.dev", password: "student123", new_password: "", role: "student" })
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const submit = async (event) => {
    event.preventDefault()
    setError("")
    setMessage("")
    try {
      if (mode === "forgot") {
        const { data } = await API.post("/auth/forgot-password", { email: form.email, new_password: form.new_password })
        setMessage(data.message)
        setForm({ ...form, password: form.new_password, new_password: "" })
        setMode("login")
        return
      }
      const path = mode === "register" ? "/auth/register" : "/auth/login"
      const payload = mode === "register" ? form : { email: form.email, password: form.password }
      const { data } = await API.post(path, payload)
      localStorage.setItem("assessiq_token", data.access_token)
      localStorage.setItem("assessiq_user", JSON.stringify(data.user))
      navigate("/")
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to continue")
    }
  }

  return (
    <div className="login-page">
      <section className="login-visual">
        <div className="logo-mark"><Brain size={42} /></div>
        <h1>AssessIQ</h1>
        <p>Intelligent performance prediction and adaptive assessment for online olympiad platforms.</p>
        <div className="signal-grid">
          <span>Adaptive Difficulty</span>
          <span>Behavioral Analytics</span>
          <span>Prediction Engine</span>
          <span>Recommendations</span>
        </div>
      </section>
      <form className="auth-panel" onSubmit={submit}>
        <div className="segmented">
          <button type="button" className={mode === "login" ? "selected" : ""} onClick={() => setMode("login")}>Login</button>
          <button type="button" className={mode === "register" ? "selected" : ""} onClick={() => setMode("register")}>Register</button>
          <button type="button" className={mode === "forgot" ? "selected" : ""} onClick={() => setMode("forgot")}>Forgot</button>
        </div>
        {mode === "register" && <label><UserRound size={18} /><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" /></label>}
        <label><Mail size={18} /><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" /></label>
        {mode !== "forgot" && <label><Lock size={18} /><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" /></label>}
        {mode === "forgot" && <label><Lock size={18} /><input type="password" value={form.new_password} onChange={(e) => setForm({ ...form, new_password: e.target.value })} placeholder="New password" /></label>}
        {mode === "register" && (
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        )}
        {error && <div className="error">{error}</div>}
        {message && <div className="success">{message}</div>}
        <button className="primary" type="submit">{mode === "login" ? "Enter AssessIQ" : mode === "register" ? "Create Account" : "Reset Password"}</button>
        <button className="ghost" type="button" onClick={() => setForm({ ...form, email: "teacher@assessiq.dev", password: "teacher123" })}>Use teacher demo</button>
      </form>
    </div>
  )
}
