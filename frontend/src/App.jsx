import { Navigate, NavLink, Route, Routes, useNavigate } from "react-router-dom"
import { Activity, BarChart3, Brain, ClipboardList, LogOut, ShieldCheck, Trophy } from "lucide-react"
import Dashboard from "./pages/Dashboard.jsx"
import Login from "./pages/Login.jsx"
import TestInterface from "./pages/TestInterface.jsx"
import Analytics from "./pages/Analytics.jsx"
import AdminPanel from "./pages/AdminPanel.jsx"

function getUser() {
  const raw = localStorage.getItem("assessiq_user")
  return raw ? JSON.parse(raw) : null
}

function RequireAuth({ children }) {
  return localStorage.getItem("assessiq_token") ? children : <Navigate to="/login" replace />
}

function Shell({ children }) {
  const navigate = useNavigate()
  const user = getUser()

  const logout = () => {
    localStorage.removeItem("assessiq_token")
    localStorage.removeItem("assessiq_user")
    navigate("/login")
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <Brain size={28} />
          <div>
            <strong>AssessIQ</strong>
            <span>Adaptive Olympiad AI</span>
          </div>
        </div>
        <nav>
          <NavLink to="/" end><Activity size={18} />Dashboard</NavLink>
          <NavLink to="/test"><ClipboardList size={18} />Test</NavLink>
          <NavLink to="/analytics"><BarChart3 size={18} />Analytics</NavLink>
          {user?.role !== "student" && <NavLink to="/admin"><ShieldCheck size={18} />Admin</NavLink>}
        </nav>
        <div className="profile">
          <Trophy size={18} />
          <div>
            <strong>{user?.name || "Student"}</strong>
            <span>{user?.role || "student"}</span>
          </div>
          <button className="icon-button" onClick={logout} aria-label="Log out"><LogOut size={18} /></button>
        </div>
      </aside>
      <main className="content">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RequireAuth><Shell><Dashboard /></Shell></RequireAuth>} />
      <Route path="/test" element={<RequireAuth><Shell><TestInterface /></Shell></RequireAuth>} />
      <Route path="/analytics" element={<RequireAuth><Shell><Analytics /></Shell></RequireAuth>} />
      <Route path="/admin" element={<RequireAuth><Shell><AdminPanel /></Shell></RequireAuth>} />
    </Routes>
  )
}

