import axios from 'axios'
const BASE=import.meta.env.VITE_BACKEND_BASE_URL||'http://localhost:8000'
const api=axios.create({baseURL:BASE,headers:{'Content-Type':'application/json'}})
export async function register(payload){
  const r=await api.post('/auth/register',payload)
  return r.data
}
export async function login(payload){
  const r=await api.post('/auth/login',payload)
  return r.data
}
export async function googleLoginUrl(){
  const r=await api.get('/auth/google/login')
  return r.data.url
}
export async function submitTest(payload,token){
  const r=await api.post('/tests/submit',payload,{headers:{Authorization:`Bearer ${token}`}})
  return r.data
}
export async function predict(payload){
  const r=await api.post('/analytics/predict',payload)
  return r.data
}
export default api
