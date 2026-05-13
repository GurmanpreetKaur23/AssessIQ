import axios from 'axios'

const BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/api'

const API = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token from localStorage on every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-logout on 401 (expired/invalid token)
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('role')
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

export async function register(payload) {
  const r = await API.post('/auth/register', payload)
  return r.data
}

export async function login(payload) {
  const r = await API.post('/auth/login', payload)
  return r.data  // { access_token }
}

export default API
