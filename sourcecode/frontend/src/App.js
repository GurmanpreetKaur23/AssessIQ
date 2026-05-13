import React from 'react'
import './App.css'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import TestInterface from './pages/TestInterface'
import Analytics from './pages/Analytics'
import AdminPanel from './pages/AdminPanel'

function App() {
  const [route, setRoute] = React.useState('login')
  const [token, setToken] = React.useState(localStorage.getItem('access_token'))

  React.useEffect(() => {
    if (token) setRoute('dashboard')
  }, [])

  function handleLogin(access_token) {
    localStorage.setItem('access_token', access_token)
    setToken(access_token)
    setRoute('dashboard')
  }

  function handleLogout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('role')
    setToken(null)
    setRoute('login')
  }

  if (route === 'login')     return <Login onLogin={handleLogin} goRegister={() => setRoute('register')} />
  if (route === 'register')  return <Register onRegistered={() => setRoute('login')} goLogin={() => setRoute('login')} />
  if (route === 'dashboard') return <Dashboard onNavigate={setRoute} onLogout={handleLogout} />
  if (route === 'test')      return <TestInterface onComplete={() => setRoute('analytics')} onBack={() => setRoute('dashboard')} />
  if (route === 'analytics') return <Analytics onBack={() => setRoute('dashboard')} />
  if (route === 'admin')     return <AdminPanel onBack={() => setRoute('dashboard')} />
  return null
}

export default App
