import React from 'react'
import { login, googleLoginUrl } from '../api'
export default function Login({onLogin,goRegister}){
  const [email,setEmail]=React.useState('')
  const [password,setPassword]=React.useState('')
  const [error,setError]=React.useState('')
  async function submit(e){
    e.preventDefault()
    try{
      const data=await login({email,password})
      onLogin(data.access_token)
    }catch(err){
      setError(err?.response?.data?.detail||'login failed')
    }
  }
  async function handleGoogle(){
    try{
      const url=await googleLoginUrl()
      window.location.href=url
    }catch(e){
      setError('google auth failed')
    }
  }
  return (
    <div className="card">
      <h2>Login</h2>
      <form onSubmit={submit}>
        <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
      <button onClick={handleGoogle}>Login with Google</button>
      <p>{error}</p>
      <p>Don't have an account? <a href="#" onClick={(e)=>{e.preventDefault();goRegister()}}>Register</a></p>
    </div>
  )
}
