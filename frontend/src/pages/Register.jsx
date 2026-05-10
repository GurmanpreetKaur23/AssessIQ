import React from 'react'
import { register } from '../api'
export default function Register({onRegistered,goLogin}){
  const [email,setEmail]=React.useState('')
  const [password,setPassword]=React.useState('')
  const [name,setName]=React.useState('')
  const [error,setError]=React.useState('')
  async function submit(e){
    e.preventDefault()
    try{
      await register({email,password,full_name:name})
      onRegistered()
    }catch(err){
      setError(err?.response?.data?.detail||'registration failed')
    }
  }
  return (
    <div className="card">
      <h2>Register</h2>
      <form onSubmit={submit}>
        <input placeholder="full name" value={name} onChange={e=>setName(e.target.value)} />
        <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button type="submit">Register</button>
      </form>
      <p>{error}</p>
      <p>Have an account? <a href="#" onClick={(e)=>{e.preventDefault();goLogin()}}>Login</a></p>
    </div>
  )
}
