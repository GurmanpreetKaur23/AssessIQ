import React from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import TestPage from './pages/Test'
import Results from './pages/Results'
function App(){
  const [route,setRoute]=React.useState('login')
  const [token,setToken]=React.useState(localStorage.getItem('access_token'))
  const [prediction,setPrediction]=React.useState(null)
  React.useEffect(()=>{
    if(token) localStorage.setItem('access_token',token)
  },[token])
  if(route==='login') return <Login onLogin={(t)=>{setToken(t);setRoute('test')}} goRegister={()=>setRoute('register')} />
  if(route==='register') return <Register onRegistered={()=>setRoute('login')} goLogin={()=>setRoute('login')} />
  if(route==='test') return <TestPage token={token} onResult={(res)=>{setPrediction(res);setRoute('results')}} />
  if(route==='results') return <Results data={prediction} goBack={()=>setRoute('test')} />
  return null
}
export default App
